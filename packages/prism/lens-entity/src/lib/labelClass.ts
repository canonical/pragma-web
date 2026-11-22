import { compactIri } from "@canonical/prism-contract/browser";
import type { OntologyNamespace } from "./types.js";

/**
 * A class's name for a status line: its label, else its compact IRI.
 *
 * @param type - The class's IRI and its label, absent when it states none.
 * @param namespaces - The prefixes and namespaces the graph declares.
 * @returns The name.
 */
export default function labelClass(
  type: { readonly uri: string; readonly label?: string | null },
  namespaces: readonly OntologyNamespace[],
): string {
  return type.label ?? compactIri(type.uri, namespaces);
}
