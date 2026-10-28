import {
  expandAddress,
  type OntologyNamespace,
} from "@canonical/prism-lens-entity";

/**
 * Build a network page's node variables: its address, compact or absolute,
 * expanded through the graph's namespaces into the IRI `node(id:)` takes.
 * The route's warm and the page's read share this one builder, so the
 * warmed store answers the read.
 *
 * @param address - The route's address, percent-decoded.
 * @param namespaces - The prefixes and namespaces the graph declares.
 * @returns The node operation's variables.
 */
export default function buildNetworkNodeVariables(
  address: string,
  namespaces: readonly OntologyNamespace[],
): { readonly id: string } {
  return { id: expandAddress(address, namespaces) };
}
