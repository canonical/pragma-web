import { PREFIX_NAME } from "./constants.js";

/**
 * Find the prefix of a compact address: `ds` in `ds:Layout`. A provider
 * leaves an address it cannot compact as the absolute IRI, and an entity
 * with no IRI at all as its GraphQL type name; neither has a prefix.
 *
 * @param curie - The node's compact address, `_meta.curie`.
 * @returns The prefix, without its colon, or `undefined` when the address
 *   did not compact: it has no colon, its text before the first colon is no
 *   prefix name, or the rest opens with `//` (a scheme and its authority).
 */
export default function findCuriePrefix(curie: string): string | undefined {
  const colon = curie.indexOf(":");
  if (colon === -1) return undefined;
  const prefix = curie.slice(0, colon);
  const isCompact =
    PREFIX_NAME.test(prefix) && !curie.startsWith("//", colon + 1);
  return isCompact ? prefix : undefined;
}
