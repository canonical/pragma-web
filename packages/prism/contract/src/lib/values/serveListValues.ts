import {
  deriveListFields,
  type FacetedSelection,
  type FacetRow,
  KIND_FACET_FIELD,
  type ListField,
  type NodeValue,
  type ReadValue,
  readNodeValues,
  type ServedClassField,
  selectFacetedInstances,
} from "../lens/index.js";
import {
  CLASS_FIELDS_QUERY,
  CLASS_INSTANCES_QUERY,
  NODE_FIELDS_QUERY,
} from "./constants.js";
import { readQueriedValues } from "./readQueriedValues.js";
import type { FacetedInstancesArgs, RunQuery } from "./types.js";
import { writeFieldValuesQuery } from "./writeFieldValuesQuery.js";

interface NodeFieldsData {
  readonly node: {
    readonly __typename: string;
    readonly _meta: { readonly fields: readonly ServedClassField[] };
  } | null;
}

interface ClassFieldsData {
  readonly ontologyClass: {
    readonly uri: string;
    readonly properties: readonly ServedClassField[];
    readonly instanceCount: number;
  } | null;
}

interface ClassInstancesData {
  readonly ontologyClass: {
    readonly instances: {
      readonly edges: readonly {
        readonly node: {
          readonly uri: string;
          readonly __typename: string;
          readonly _meta: {
            readonly type: {
              readonly uri: string;
              readonly label: string | null;
            };
          };
        };
      }[];
    };
  };
}

interface FieldValuesData {
  readonly node: Readonly<Record<string, unknown>> | null;
}

/** A node's values for the fields named, read through the provider's schema. */
const readFieldValues = async (
  run: RunQuery,
  sdl: string,
  node: { readonly uri: string; readonly typename: string },
  fields: readonly string[],
): Promise<Readonly<Record<string, readonly ReadValue[]>>> => {
  const query = writeFieldValuesQuery(sdl, node.typename, fields);
  if (query === null) return {};
  const data = (await run(query, { id: node.uri })) as FieldValuesData;
  return readQueriedValues(data.node, fields);
};

/** The fields named, in their order, among a node's list fields; unknown names are skipped. */
const pickFields = (
  fields: readonly ListField[],
  names: readonly string[],
): readonly ListField[] =>
  names.flatMap((name) => fields.filter((field) => field.id === name));

/**
 * `Node.values`: a node's values for the fields named, or, without names,
 * for the fields its class's lens displays, in the lens's order. Reads only
 * what the provider's own schema serves, so every provider answers alike.
 *
 * @param run - Runs a query against the provider's schema.
 * @param sdl - The provider's full SDL.
 * @param uri - The node's IRI.
 * @param names - The fields' served names, or null for the displayed ones.
 * @returns One value per field.
 * @note Impure: queries the provider.
 */
export async function serveNodeValues(
  run: RunQuery,
  sdl: string,
  uri: string,
  names?: readonly string[] | null,
): Promise<readonly NodeValue[]> {
  const { node } = (await run(NODE_FIELDS_QUERY, {
    id: uri,
  })) as NodeFieldsData;
  if (node === null) return [];
  const { fields, display } = deriveListFields(node._meta.fields);
  const chosen = pickFields(
    fields,
    names ?? display.map((field) => field.field),
  );
  const values = await readFieldValues(
    run,
    sdl,
    { uri, typename: node.__typename },
    chosen.map((field) => field.id),
  );
  return readNodeValues(chosen, (field) => values[field.id] ?? []);
}

/**
 * `Query.facetedInstances`: a class's instances that the filters keep, in
 * the sort's order, with their number and the facets of the class's list
 * fields and of its kind. An unknown class is an empty set.
 *
 * @param run - Runs a query against the provider's schema.
 * @param sdl - The provider's full SDL.
 * @param args - The class, the filters and the sort.
 * @returns The selection, every kept IRI in order.
 * @throws When a filter or the sort names a field the list cannot use so.
 * @note Impure: queries the provider.
 */
export async function serveFacetedInstances(
  run: RunQuery,
  sdl: string,
  args: FacetedInstancesArgs,
): Promise<FacetedSelection> {
  const { ontologyClass } = (await run(CLASS_FIELDS_QUERY, {
    uri: args.classUri,
  })) as ClassFieldsData;
  if (ontologyClass === null) {
    return { uris: [], totalCount: 0, facets: [] };
  }
  const fields = [
    ...deriveListFields(ontologyClass.properties).fields,
    KIND_FACET_FIELD,
  ];
  const read = fields
    .filter(
      (field) =>
        field !== KIND_FACET_FIELD &&
        (field.facetable || field.id === args.sort?.field),
    )
    .map((field) => field.id);
  const data = (await run(CLASS_INSTANCES_QUERY, {
    uri: ontologyClass.uri,
    first: ontologyClass.instanceCount,
  })) as ClassInstancesData;
  const rows: FacetRow[] = await Promise.all(
    data.ontologyClass.instances.edges.map(async ({ node }) => ({
      uri: node.uri,
      values: {
        ...(await readFieldValues(
          run,
          sdl,
          { uri: node.uri, typename: node.__typename },
          read,
        )),
        [KIND_FACET_FIELD.id]: [
          {
            text: node._meta.type.label ?? node._meta.type.uri,
            uri: node._meta.type.uri,
          },
        ],
      },
    })),
  );
  return selectFacetedInstances(rows, fields, args.filters ?? [], args.sort);
}
