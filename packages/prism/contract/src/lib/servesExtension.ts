import { buildSchema, type GraphQLField } from "graphql";
import { PROVIDER_EXTENSIONS } from "./constants.js";
import type { ProviderExtension } from "./types.js";

/**
 * Whether a root field has the signature an extension declares: the same
 * arguments by name and type, in the same order, and the same return type.
 */
const matchesSignature = (
  field: GraphQLField<unknown, unknown>,
  extension: ProviderExtension,
): boolean => {
  const { args, type } = PROVIDER_EXTENSIONS[extension];
  return (
    String(field.type) === type &&
    field.args.length === args.length &&
    args.every(
      ([name, argType], index) =>
        field.args.at(index)?.name === name &&
        String(field.args.at(index)?.type) === argType,
    )
  );
};

/**
 * Whether a provider's schema serves one extension: its `Query` declares the
 * extension's root field with the declared signature. A field of the right
 * name with another signature does not serve it, and neither does an SDL
 * that does not build, since a reader could select nothing from it.
 *
 * @param providerSdl - The provider's full SDL.
 * @param extension - The extension to look for.
 * @returns `true` when the provider serves the extension.
 */
export function servesExtension(
  providerSdl: string,
  extension: ProviderExtension,
): boolean {
  let field: GraphQLField<unknown, unknown> | undefined;
  try {
    field = buildSchema(providerSdl).getQueryType()?.getFields()[extension];
  } catch {
    return false;
  }
  return field !== undefined && matchesSignature(field, extension);
}
