import { BINDING_ID_PATTERN } from "./constants.js";
import type { EntityBinding } from "./types.js";

/**
 * Assert `value` is a non-empty string, naming the binding field it fills.
 *
 * @throws When `value` is not a string, or is empty.
 */
const assertField = (value: unknown, field: string): void => {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`defineBinding: ${field} must be a non-empty string`);
  }
};

/**
 * Declare an entity binding, checked where it is written.
 *
 * `const TId` keeps the id a literal type, so code built on the binding can
 * derive names from it (`${id}Entity`) at the type level.
 *
 * @param binding - The binding's id, class URI and GraphQL type name.
 * @returns The same binding, by identity.
 * @throws When a field is empty or not a string, or the id is not lower
 *   camel case.
 */
export const defineBinding = <const TId extends string>(
  binding: EntityBinding<TId>,
): EntityBinding<TId> => {
  assertField(binding.id, "id");
  assertField(binding.classUri, "classUri");
  assertField(binding.typename, "typename");
  if (!BINDING_ID_PATTERN.test(binding.id)) {
    throw new Error(
      `defineBinding: id "${binding.id}" is not lower camel case (${BINDING_ID_PATTERN})`,
    );
  }
  return binding;
};
