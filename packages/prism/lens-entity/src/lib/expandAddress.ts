import type { OntologyNamespace } from "./types.js";

/**
 * Expand an entity's address into the absolute IRI `node(id:)` accepts.
 *
 * The lens's entity route takes either form of an address: the compact one
 * the graph's `_meta.curie` gives and the site's homes build links from
 * (`metro:northgate`), or the absolute IRI itself. `node(id:)` accepts only
 * the IRI, so a compact address whose prefix the graph declares becomes that
 * prefix's namespace followed by the local part; `metro:` (an empty local
 * part) is the namespace itself.
 *
 * Anything else passes through unchanged: an absolute IRI, whose scheme is
 * no declared prefix, and an address with an unknown prefix, which
 * `node(id:)` then answers with null, so the page renders its not-found
 * state rather than throwing.
 *
 * @param address - The route's address, percent-decoded.
 * @param namespaces - The prefixes and namespaces the graph declares.
 * @returns The absolute IRI, or `address` unchanged.
 */
export default function expandAddress(
  address: string,
  namespaces: readonly OntologyNamespace[],
): string {
  const colon = address.indexOf(":");
  if (colon === -1) return address;
  const prefix = address.slice(0, colon);
  const match = namespaces.find((candidate) => candidate.prefix === prefix);
  if (match === undefined) return address;
  return `${match.namespace}${address.slice(colon + 1)}`;
}
