import {
  buildSchema,
  type GraphQLField,
  type GraphQLNamedType,
  type GraphQLSchema,
  getNamedType,
  isInterfaceType,
  isLeafType,
  isNonNullType,
  isObjectType,
} from "graphql";
import {
  EMBEDDED_VALUE_SELECTION,
  NODE_INTERFACE,
  NODE_VALUE_SELECTION,
} from "./constants.js";

const schemas = new Map<string, GraphQLSchema>();

/**
 * The schema an SDL builds, built once per SDL.
 *
 * @note Impure: caches the built schema.
 */
const buildCachedSchema = (sdl: string): GraphQLSchema => {
  const cached = schemas.get(sdl);
  if (cached !== undefined) return cached;
  const schema = buildSchema(sdl, { assumeValidSDL: true });
  schemas.set(sdl, schema);
  return schema;
};

const isNodeType = (type: GraphQLNamedType): boolean =>
  type.name === NODE_INTERFACE ||
  ((isObjectType(type) || isInterfaceType(type)) &&
    type.getInterfaces().some((iface) => iface.name === NODE_INTERFACE));

const hasMeta = (type: GraphQLNamedType): boolean =>
  (isObjectType(type) || isInterfaceType(type)) &&
  type.getFields()._meta !== undefined;

/** How one field is selected, or null when a list cannot read it. */
const selectField = (
  name: string,
  field: GraphQLField<unknown, unknown> | undefined,
): string | null => {
  if (
    field === undefined ||
    field.args.some((arg) => isNonNullType(arg.type))
  ) {
    return null;
  }
  const target = getNamedType(field.type);
  if (isLeafType(target)) return name;
  if (isNodeType(target)) return `${name} ${NODE_VALUE_SELECTION}`;
  return hasMeta(target) ? `${name} ${EMBEDDED_VALUE_SELECTION}` : null;
};

/**
 * The query that reads a node's values for list fields: each field its
 * type declares, a leaf as itself, a node by its IRI and title, an
 * embedded value by its title. A field the type does not declare (a
 * property it projects no field for) is left out.
 *
 * @param sdl - The provider's full SDL.
 * @param typename - The node's object type.
 * @param fields - The fields' served names.
 * @returns The query, taking `$id`, or null when no field can be read.
 * @note Impure: caches the schema built from `sdl`.
 */
export function writeFieldValuesQuery(
  sdl: string,
  typename: string,
  fields: readonly string[],
): string | null {
  const type = buildCachedSchema(sdl).getType(typename);
  const declared =
    isObjectType(type) || isInterfaceType(type) ? type.getFields() : {};
  const selections = fields.flatMap((name) => {
    const selection = selectField(name, declared[name]);
    return selection === null ? [] : [selection];
  });
  return selections.length === 0
    ? null
    : `query FieldValues($id: ID!) { node(id: $id) { ... on ${typename} { ${selections.join(" ")} } } }`;
}
