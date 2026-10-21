import type { OntologyNamespace } from "../types.js";
import { compactUri } from "../uris.js";

/** `https://…/Subcomponent` → `ds:Subcomponent`; datatype ranges (e.g.
 * `xsd:string` shapes) pass through the codec unchanged. */
export default function formatRange(
  range: string,
  namespaces: readonly OntologyNamespace[],
): string {
  return compactUri(range, namespaces);
}
