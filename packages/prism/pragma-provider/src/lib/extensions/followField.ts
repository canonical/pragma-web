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
 * The compiler's lookups do not reach every type the contract names (the
 * contract's own `OntologyClass` and `OntologyProperty` among them); a field
 * that returns one does.
 *
 * @param owner - The type the field belongs to.
 * @param name - The field's name.
 * @returns The field's named object type.
 * @throws When `owner` has no such field or the field is not object-typed.
 */
export const followField = (
  owner: GraphQLObjectType | GraphQLInterfaceType,
  name: string,
): GraphQLObjectType => {
  const target = getNamedType(owner.getFields()[name]?.type);
  if (!isObjectType(target)) {
    throw new Error(
      `${owner.name}.${name} is not an object-typed field, so an extension cannot reach the type it returns`,
    );
  }
  return target;
};
