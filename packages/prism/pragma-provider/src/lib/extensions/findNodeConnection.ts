import {
  type GraphQLInterfaceType,
  type GraphQLObjectType,
  getNamedType,
  isObjectType,
} from "graphql";

/**
 * The object type a field of `owner` returns, unwrapped from lists and
 * non-null.
 *
 * @throws When `owner` has no such field or the field is not object-typed.
 */
const followField = (
  owner: GraphQLObjectType | GraphQLInterfaceType,
  name: string,
): GraphQLObjectType => {
  const target = getNamedType(owner.getFields()[name]?.type);
  if (!isObjectType(target)) {
    throw new Error(
      `${owner.name}.${name} is not an object-typed field, so an extension cannot reach NodeConnection through Node._meta.type.instances`,
    );
  }
  return target;
};

/**
 * The compiled schema's `NodeConnection`, reached from the `Node` interface.
 *
 * The extension factory's lookups see the generated object types and
 * interfaces but not the connection types, which the compiler builds in a
 * registry of its own; declaring a second type of the same name would fail
 * schema validation. The contract guarantees a path to it instead:
 * `Node._meta: EntityMeta!`, `EntityMeta.type: OntologyClass!`,
 * `OntologyClass.instances: NodeConnection!`. Call this once the schema's
 * types exist: from an extension factory, which the compiler runs after
 * building them, or from a field thunk.
 *
 * @param node - The schema's `Node` interface.
 * @returns The `NodeConnection` object type.
 * @throws Naming the hop that is missing, when the path is broken.
 */
export const findNodeConnection = (
  node: GraphQLInterfaceType,
): GraphQLObjectType =>
  followField(followField(followField(node, "_meta"), "type"), "instances");
