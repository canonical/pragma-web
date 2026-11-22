import type { Term } from "@canonical/ke";
import {
  type CompilerContext,
  createStoreQueryFn,
  isAbsoluteIri,
  isSafeIri,
  type QueryFn,
} from "@canonical/ke-graphql";
import {
  compactIri,
  compareCodePoints,
  STATEMENTS_MAX_DEPTH,
  STATEMENTS_PER_PREDICATE,
  STATEMENTS_PER_PREDICATE_MAX,
} from "@canonical/prism-contract";
import {
  GraphQLEnumType,
  type GraphQLFieldConfig,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  type GraphQLResolveInfo,
  GraphQLString,
  GraphQLUnionType,
} from "graphql";
import { type ExtensionFactory, followField } from "../extensions/index.js";
import {
  buildDescribeQuery,
  collectPrefixes,
  MAX_BLANK_DEPTH,
  RDF_LANG_STRING,
  RDF_TYPE,
  XSD_STRING,
} from "../source/index.js";
import {
  buildBlankQuery,
  buildCountQuery,
  buildWindowQuery,
} from "./buildStatementQueries.js";
import { comparePredicates } from "./comparePredicates.js";
import { compareTerms } from "./compareTerms.js";
import { groupTermStatements } from "./groupTermStatements.js";
import { selectTerms } from "./selectTerms.js";
import type {
  BlankStatements,
  StatementDirection,
  StatementGroupSource,
  StatementGroupsSource,
  StatementsArgs,
  TermStatement,
} from "./types.js";
import { writeSignature } from "./writeSignature.js";

/** A resolved `StatementValue`, its member named for the union. */
type StatementValueSource =
  | { readonly __typename: "StatementNode"; readonly node: unknown }
  | {
      readonly __typename: "StatementLiteral";
      readonly lexical: string;
      readonly datatype: string;
      readonly lang: string | null;
    }
  | {
      readonly __typename: "StatementNested";
      readonly typeUri: string | null;
      readonly groups: readonly StatementGroupSource[];
    }
  | {
      readonly __typename: "StatementForeign";
      readonly uri: string;
      readonly curie: string;
    };

/**
 * Resolve a root field of the schema itself, so a value resolves exactly
 * as that field would serve it.
 *
 * @throws When the schema has no such root field.
 * @note Impure: reads the store through the context's loaders.
 */
const resolveRootField = (
  info: GraphQLResolveInfo,
  name: string,
  args: Readonly<Record<string, string>>,
  context: CompilerContext,
): unknown => {
  const resolve = info.schema.getQueryType()?.getFields()[name]?.resolve;
  if (resolve === undefined) {
    throw new Error(
      `the schema has no Query.${name} to resolve values through`,
    );
  }
  return resolve(undefined, args, context, info);
};

/** The local name of an IRI: what follows its last `#` or `/`. */
const readLocalName = (uri: string): string =>
  uri.slice(Math.max(uri.lastIndexOf("#"), uri.lastIndexOf("/")) + 1);

/** Statements read in rows of a subject, a predicate and an object, by the
 * subject's label. */
const indexStatements = (
  rows: readonly { subject: Term; predicate: Term; object: Term }[],
): BlankStatements =>
  rows.reduce(
    (index, { subject, predicate, object }) =>
      index.set(subject.value, [
        ...(index.get(subject.value) ?? []),
        { predicate: predicate.value, term: object },
      ]),
    new Map<string, readonly TermStatement[]>(),
  );

/**
 * Read the statements `uri` makes and those of every blank node below it,
 * down to `depth` blank nodes in a row, indexed by subject.
 *
 * @note Impure: queries the store once per level.
 */
const describeTree = async (
  query: QueryFn,
  uri: string,
  depth: number,
): Promise<BlankStatements> => {
  const quads = [];
  for (let level = 0; level <= depth; level += 1) {
    const result = await query(buildDescribeQuery(uri, level));
    // The store reads an empty CONSTRUCT as an empty SELECT.
    if (result.type !== "construct" || result.quads.length === 0) break;
    quads.push(...result.quads);
  }
  return indexStatements(quads);
};

/**
 * The statements of the value `path` reaches from `uri`: per pair of
 * segments, the blank value of the predicate of that local name at that
 * zero-based index, blank values ordered by their statements. Null when a
 * segment selects nothing.
 *
 * @note Impure: queries the store.
 */
const readPathStatements = async (
  query: QueryFn,
  uri: string,
  path: readonly string[],
  perPredicate: number,
  compact: (uri: string) => string,
): Promise<StatementGroupsSource | null> => {
  if (path.length % 2 !== 0) return null;
  const steps = path.length / 2;
  const tree = await describeTree(
    query,
    uri,
    Math.min(steps + 1, MAX_BLANK_DEPTH),
  );
  let current = uri;
  for (let step = 0; step < steps; step += 1) {
    const [name, key] = path.slice(step * 2, step * 2 + 2);
    const chosen = (tree.get(current) ?? [])
      .filter(
        ({ predicate, term }) =>
          term.termType === "BlankNode" && readLocalName(predicate) === name,
      )
      .map(({ term }) => term.value)
      .toSorted((a, b) =>
        compareCodePoints(writeSignature(a, tree), writeSignature(b, tree)),
      )
      .at(/^\d+$/.test(String(key)) ? Number(key) : Number.POSITIVE_INFINITY);
    if (chosen === undefined) return null;
    current = chosen;
  }
  const statements = tree.get(current) ?? [];
  return {
    subject: null,
    groups: groupTermStatements(statements, perPredicate, 1, tree, compact),
    total: statements.length,
  };
};

/**
 * Read `uri`'s statements in one direction: their count per predicate,
 * then each predicate's first `perPredicate` values, then the statements
 * of the blank nodes among those values. A group holding blank values reads
 * all of its values, since the store cannot order blank nodes by their
 * statements: the first `perPredicate` are then those `compareTerms` puts
 * first, so a blank value's position among them is its `path` index.
 *
 * @note Impure: queries the store, once to count, once or twice per
 * predicate and once for the blank values.
 */
const readEntityStatements = async (
  query: QueryFn,
  uri: string,
  direction: StatementDirection,
  perPredicate: number,
  compact: (uri: string) => string,
): Promise<StatementGroupsSource> => {
  const counts = (await selectTerms(query, buildCountQuery(uri, direction)))
    .map((row) => ({ predicate: row.p.value, total: Number(row.n.value) }))
    .toSorted((a, b) => comparePredicates(compact)(a.predicate, b.predicate));
  const readWindow = async (
    predicate: string,
    limit: number,
  ): Promise<readonly Term[]> =>
    (
      await selectTerms(
        query,
        buildWindowQuery(uri, direction, predicate, limit),
      )
    ).map((row) => row.v);
  const windows = await Promise.all(
    counts.map(async ({ predicate, total }) => {
      const first = await readWindow(predicate, perPredicate);
      const hasBlank = first.some((term) => term.termType === "BlankNode");
      return {
        predicate,
        total,
        terms:
          hasBlank && total > first.length
            ? await readWindow(predicate, total)
            : first,
      };
    }),
  );
  const blanks = windows.some(({ terms }) =>
    terms.some((term) => term.termType === "BlankNode"),
  )
    ? indexStatements(
        (await selectTerms(query, buildBlankQuery(uri, direction))).map(
          (row) => ({ subject: row.v, predicate: row.p, object: row.o }),
        ),
      )
    : new Map<string, readonly TermStatement[]>();
  return {
    subject: uri,
    groups: windows.map(({ predicate, total, terms }) => ({
      predicate,
      total,
      terms: terms.toSorted(compareTerms(blanks)).slice(0, perPredicate),
      perPredicate,
      depth: 1,
      blanks,
      compact,
    })),
    total: counts.reduce((sum, { total }) => sum + total, 0),
  };
};

/**
 * Resolve one value of a group: a node the schema resolves, else a foreign
 * IRI; a literal with its datatype; a blank node expanded in place while
 * the group sits above `STATEMENTS_MAX_DEPTH`.
 *
 * @note Impure: resolves nodes through the schema's `Query.node`.
 */
const resolveValue = async (
  term: Term,
  group: StatementGroupSource,
  context: CompilerContext,
  info: GraphQLResolveInfo,
): Promise<StatementValueSource> => {
  if (term.termType === "Literal") {
    const lang =
      term.language === undefined || term.language === ""
        ? null
        : term.language;
    return {
      __typename: "StatementLiteral",
      lexical: term.value,
      datatype: lang === null ? (term.datatype ?? XSD_STRING) : RDF_LANG_STRING,
      lang,
    };
  }
  if (term.termType === "BlankNode") {
    const statements = group.blanks.get(term.value) ?? [];
    const type = statements.find(
      ({ predicate, term: object }) =>
        predicate === RDF_TYPE && object.termType === "NamedNode",
    );
    return {
      __typename: "StatementNested",
      typeUri: type?.term.value ?? null,
      groups:
        group.depth < STATEMENTS_MAX_DEPTH
          ? groupTermStatements(
              statements,
              group.perPredicate,
              group.depth + 1,
              group.blanks,
              group.compact,
            )
          : [],
    };
  }
  const node = await resolveRootField(
    info,
    "node",
    { id: term.value },
    context,
  );
  return node == null
    ? {
        __typename: "StatementForeign",
        uri: term.value,
        curie: group.compact(term.value),
      }
    : { __typename: "StatementNode", node };
};

/**
 * Resolve `Query.statements`: refuse an argument that is not an absolute
 * IRI safe to send, read along `path` when one is given (outgoing only),
 * else read the entity's statements in the direction asked.
 *
 * @note Impure: queries the store.
 */
const resolveStatements = async (
  _root: unknown,
  { uri, path, perPredicate, direction }: StatementsArgs,
  context: CompilerContext,
  info: GraphQLResolveInfo,
): Promise<StatementGroupsSource | null> => {
  if (!isAbsoluteIri(uri) || !isSafeIri(uri)) return null;
  const bound = Math.min(
    Math.max(perPredicate ?? STATEMENTS_PER_PREDICATE, 1),
    STATEMENTS_PER_PREDICATE_MAX,
  );
  const query = createStoreQueryFn(await context.store);
  const namespaces = [...collectPrefixes(context)].map(
    ([prefix, namespace]) => ({ prefix, namespace }),
  );
  const compact = (iri: string): string => compactIri(iri, namespaces);
  if (path !== undefined && path !== null && path.length > 0) {
    return direction === "IN"
      ? null
      : readPathStatements(query, uri, path, bound, compact);
  }
  const read = await readEntityStatements(
    query,
    uri,
    direction ?? "OUT",
    bound,
    compact,
  );
  if (read.groups.length > 0) return read;
  return (await resolveRootField(info, "node", { id: uri }, context)) == null
    ? null
    : read;
};

/**
 * The `Query.statements` root field, as a ke-graphql extension factory: an
 * entity's statements in one direction, grouped by predicate, each group
 * bounded with its true count. The types mirror the contract's
 * `schema/statements.graphql`, built on the compiled `Node`,
 * `OntologyProperty` and `OntologyClass` so the served schema holds one
 * type of each name.
 *
 * A root field for the reason `createProseExtensions` gives: it is the one
 * position every provider can serve and every reader can select the same
 * way.
 *
 * @returns The extension factory, to compose into `createSchemaPlugin`'s
 * `extensions`.
 * @throws From the factory, when the compiled schema lacks `Node`, or the
 * contract's path from it to `OntologyClass` (`Node._meta.type`) and to
 * `OntologyProperty` (`OntologyClass.properties.property`).
 */
export const createStatementsExtensions =
  (): ExtensionFactory =>
  ({ iface }) => {
    const node = iface("Node");
    if (node === undefined) {
      throw new Error(
        "the compiled schema has no Node, which statements is built on",
      );
    }
    const ontologyClass = followField(followField(node, "_meta"), "type");
    const property = followField(
      followField(ontologyClass, "properties"),
      "property",
    );
    const direction = new GraphQLEnumType({
      name: "StatementDirection",
      description: "Which side of a statement the entity stands on.",
      values: {
        OUT: { description: "Statements whose subject is the entity." },
        IN: { description: "Statements whose object is the entity." },
      },
    });
    const statementNode = new GraphQLObjectType({
      name: "StatementNode",
      description: "A value that is a node the graph resolves.",
      fields: { node: { type: new GraphQLNonNull(node) } },
    });
    const statementLiteral = new GraphQLObjectType({
      name: "StatementLiteral",
      description: "A literal value.",
      fields: {
        lexical: { type: new GraphQLNonNull(GraphQLString) },
        datatype: {
          type: new GraphQLNonNull(GraphQLID),
          description: "The datatype's absolute IRI.",
        },
        lang: {
          type: GraphQLString,
          description: "The language tag, or null for a literal without one.",
        },
      },
    });
    const statementForeign = new GraphQLObjectType({
      name: "StatementForeign",
      description: "An IRI in a namespace the provider has not loaded.",
      fields: {
        uri: { type: new GraphQLNonNull(GraphQLID) },
        curie: { type: new GraphQLNonNull(GraphQLString) },
      },
    });
    const statementNested: GraphQLObjectType = new GraphQLObjectType({
      name: "StatementNested",
      description:
        "A blank node or value-class instance, expanded in place, at most two levels deep.",
      fields: () => ({
        type: {
          type: ontologyClass,
          resolve: (
            { typeUri }: { typeUri: string | null },
            _args: unknown,
            context: CompilerContext,
            info: GraphQLResolveInfo,
          ) =>
            typeUri === null
              ? null
              : resolveRootField(
                  info,
                  "ontologyClass",
                  { uri: typeUri },
                  context,
                ),
        },
        groups: { type: groupList },
      }),
    });
    const statementValue = new GraphQLUnionType({
      name: "StatementValue",
      description: "One value of a statement: the other side from the entity.",
      types: [
        statementNode,
        statementLiteral,
        statementNested,
        statementForeign,
      ],
      resolveType: ({ __typename }: StatementValueSource) => __typename,
    });
    const statementGroup = new GraphQLObjectType<
      StatementGroupSource,
      CompilerContext
    >({
      name: "StatementGroup",
      description:
        "The statements sharing one predicate, bounded, with their true count.",
      fields: {
        predicate: {
          type: property,
          description:
            "The predicate as the TBox declares it, or null when the TBox does not.",
          resolve: (group, _args, context, info) =>
            resolveRootField(
              info,
              "ontologyProperty",
              { uri: group.predicate },
              context,
            ),
        },
        predicateUri: {
          type: new GraphQLNonNull(GraphQLID),
          description: "The predicate's absolute IRI.",
          resolve: (group) => group.predicate,
        },
        total: {
          type: new GraphQLNonNull(GraphQLInt),
          description:
            "How many statements the graph holds with this predicate, before the bound.",
        },
        values: {
          type: new GraphQLNonNull(
            new GraphQLList(new GraphQLNonNull(statementValue)),
          ),
          description:
            "The first values, by lexical form then IRI, at most the bound asked for.",
          resolve: (group, _args, context, info) =>
            Promise.all(
              group.terms.map((term) =>
                resolveValue(term, group, context, info),
              ),
            ),
        },
      },
    });
    const groupList = new GraphQLNonNull(
      new GraphQLList(new GraphQLNonNull(statementGroup)),
    );
    const statementGroups = new GraphQLObjectType<
      StatementGroupsSource,
      CompilerContext
    >({
      name: "StatementGroups",
      description:
        "An entity's statements in one direction, grouped by predicate.",
      fields: {
        subject: {
          type: node,
          description:
            "The entity the statements are about, or null for a value reached by `path`.",
          resolve: ({ subject }, _args, context, info) =>
            subject === null
              ? null
              : resolveRootField(info, "node", { id: subject }, context),
        },
        groups: {
          type: groupList,
          description:
            "One group per predicate: rdf:type first, then the lens's order, then by CURIE.",
        },
        total: {
          type: new GraphQLNonNull(GraphQLInt),
          description:
            "Every statement in this direction, before the per-predicate bound.",
        },
      },
    });
    const statements: GraphQLFieldConfig<
      unknown,
      CompilerContext,
      StatementsArgs
    > = {
      type: statementGroups,
      description:
        "The statements about the entity `uri` (an absolute IRI) in one direction, or null when the graph holds no such entity.",
      args: {
        uri: { type: new GraphQLNonNull(GraphQLID) },
        path: {
          type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
          description:
            "A path into a value reached from `uri`: predicate local names, each followed by a record key or a zero-based index.",
        },
        perPredicate: {
          type: GraphQLInt,
          defaultValue: STATEMENTS_PER_PREDICATE,
          description: "How many values each group returns, from 1 to 50.",
        },
        direction: { type: direction, defaultValue: "OUT" },
      },
      resolve: resolveStatements,
    };
    return { Query: { statements } };
  };
