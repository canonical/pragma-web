import {
  type CompilerContext,
  executeLocal,
  paginateUriWindow,
} from "@canonical/ke-graphql";
import {
  type FacetedInstancesArgs,
  LIST_EXTENSION_TYPES_SDL,
  type RunQuery,
  serveFacetedInstances,
  serveNodeValues,
} from "@canonical/prism-contract";
import {
  defaultFieldResolver,
  type ExecutionResult,
  extendSchema,
  type GraphQLFieldResolver,
  type GraphQLInterfaceType,
  type GraphQLResolveInfo,
  type GraphQLSchema,
  getNamedType,
  isInterfaceType,
  parse,
  printSchema,
} from "graphql";
import {
  findNodeConnection,
  resolveNodeEdges,
  toNodeConnection,
} from "../extensions/index.js";

/** The field every node gains, as each implementation declares it. */
const VALUES_FIELD =
  "\"The node's values for the list fields named, or, without names, for the fields its class's lens displays, in the lens's order.\" values(fields: [ID!]): [NodeValue!]!";

interface ValuesArgs {
  readonly fields?: readonly string[] | null;
}

interface FacetedArgs extends FacetedInstancesArgs {
  readonly first?: number | null;
  readonly after?: string | null;
}

/**
 * The SDL that adds `values` to `Node` and every implementation, and
 * `Query.facetedInstances` paged over the compiled schema's own edge type.
 */
const writeListSdl = (
  schema: GraphQLSchema,
  node: GraphQLInterfaceType,
): string => {
  const connection = findNodeConnection(node).getFields();
  const edge = getNamedType(connection.edges.type).name;
  const pageInfo = getNamedType(connection.pageInfo.type).name;
  const { interfaces, objects } = schema.getImplementations(node);
  return [
    LIST_EXTENSION_TYPES_SDL,
    `"A page of a faceted set, the set's size and its facets."
type FacetedConnection { edges: [${edge}!]! pageInfo: ${pageInfo}! totalCount: Int! facets: [Facet!]! }`,
    ...[node, ...interfaces].map(
      (type) => `extend interface ${type.name} { ${VALUES_FIELD} }`,
    ),
    ...objects.map((type) => `extend type ${type.name} { ${VALUES_FIELD} }`),
    `extend type Query {
  "The instances of the class \`classUri\` names that \`filters\` keep, in \`sort\`'s order (the IRIs' without one), with their number and the facets of the class's list fields and of its kind."
  facetedInstances(classUri: ID!, filters: [FieldFilter!], sort: FieldSort, first: Int, after: String): FacetedConnection!
}`,
  ].join("\n\n");
};

/** Runs a query against the served schema in the request's context. */
const createRun =
  (schema: GraphQLSchema, contextValue: CompilerContext): RunQuery =>
  async (source, variableValues) => {
    // The contract's list queries use neither @defer nor @stream, so the
    // compiled schema answers each with one result.
    const result = (await executeLocal({
      schema,
      source,
      document: parse(source),
      variableValues: { ...variableValues },
      contextValue,
    })) as ExecutionResult;
    const error = result.errors?.at(0);
    if (error !== undefined) {
      throw error;
    }
    return result.data;
  };

/** The IRI of the node a field is resolved on, read by its own `uri` field. */
const readNodeUri = async (
  source: unknown,
  context: unknown,
  info: GraphQLResolveInfo,
): Promise<string> => {
  const resolve =
    info.parentType.getFields().uri?.resolve ?? defaultFieldResolver;
  return String(
    await resolve(source, {}, context, { ...info, fieldName: "uri" }),
  );
};

/**
 * Serves the two list extensions on the compiled schema: `values` on every
 * node and `Query.facetedInstances`, both read through the served schema
 * itself (the contract's `serveNodeValues` and `serveFacetedInstances`), so
 * they answer what the graph example's do.
 *
 * @param schema - The compiled schema with the site lens served.
 * @returns The schema serving both extensions.
 * @throws When the schema has no `Node` interface.
 */
export const extendWithList = (schema: GraphQLSchema): GraphQLSchema => {
  const node = schema.getType("Node");
  if (!isInterfaceType(node)) {
    throw new Error(
      "the compiled schema has no Node interface to serve values on",
    );
  }
  const extended = extendSchema(schema, parse(writeListSdl(schema, node)));
  const sdl = printSchema(extended);
  const values: GraphQLFieldResolver<unknown, unknown, ValuesArgs> = async (
    source,
    args,
    context,
    info,
  ) =>
    serveNodeValues(
      createRun(info.schema, context as CompilerContext),
      sdl,
      await readNodeUri(source, context, info),
      args.fields,
    );
  for (const type of extended.getImplementations(
    extended.getType("Node") as GraphQLInterfaceType,
  ).objects) {
    type.getFields().values.resolve = values as GraphQLFieldResolver<
      unknown,
      unknown
    >;
  }
  const faceted: GraphQLFieldResolver<unknown, unknown, FacetedArgs> = async (
    _root,
    args,
    context,
    info,
  ) => {
    const selection = await serveFacetedInstances(
      createRun(info.schema, context as CompilerContext),
      sdl,
      args,
    );
    const page = paginateUriWindow(selection.uris, {
      first: args.first,
      after: args.after,
    });
    return {
      ...toNodeConnection(
        await resolveNodeEdges(page.window, context as CompilerContext, info),
        page,
      ),
      totalCount: selection.totalCount,
      facets: selection.facets,
    };
  };
  const query = extended.getQueryType()?.getFields();
  if (query !== undefined) {
    query.facetedInstances.resolve = faceted as GraphQLFieldResolver<
      unknown,
      unknown
    >;
  }
  return extended;
};
