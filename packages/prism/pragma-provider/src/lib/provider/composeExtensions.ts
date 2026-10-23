import type { SchemaExtensions } from "@canonical/ke-graphql";
import type { ExtensionFactory } from "../extensions/index.js";

/**
 * Compose extension factories into one, which hands each the compiler's
 * lookups and merges the fields they add, type by type.
 *
 * @param factories - The factories, each adding fields of its own.
 * @returns One factory adding every field the given ones add.
 * @throws From the composed factory, when two factories add the same field
 * to the same type.
 */
export const composeExtensions =
  (factories: readonly ExtensionFactory[]): ExtensionFactory =>
  (lookups) => {
    const composed: SchemaExtensions = {};
    for (const factory of factories) {
      for (const [typeName, fields] of Object.entries(factory(lookups))) {
        const merged = Object.hasOwn(composed, typeName)
          ? composed[typeName]
          : {};
        for (const [fieldName, field] of Object.entries(fields)) {
          if (Object.hasOwn(merged, fieldName)) {
            throw new Error(
              `extension field ${typeName}.${fieldName} is declared by more than one extension`,
            );
          }
          merged[fieldName] = field;
        }
        composed[typeName] = merged;
      }
    }
    return composed;
  };
