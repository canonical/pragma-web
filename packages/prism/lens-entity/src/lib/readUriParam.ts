import { ENTITY_URI_PARAM } from "./constants.js";

/**
 * Read the entity route's `:uri` param off a route match, asserting its
 * shape at the one boundary where params are `unknown`-typed records.
 *
 * @param params - The matched route params, percent-decoded.
 * @returns The entity's address, compact or absolute.
 * @throws When the param is missing, not a string, or empty.
 */
export default function readUriParam(
  params: Readonly<Record<string, unknown>>,
): string {
  const uri = params[ENTITY_URI_PARAM];
  if (typeof uri !== "string" || uri.length === 0) {
    throw new Error(
      `entity :${ENTITY_URI_PARAM} param must be a non-empty string`,
    );
  }
  return uri;
}
