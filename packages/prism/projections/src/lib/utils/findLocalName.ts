import { THROUGH_LAST_SEPARATOR } from "./constants.js";

/**
 * Find the local name of an IRI: the text after its last `#`, `/` or `:`,
 * as a provider computes a title for an entity with no label.
 *
 * @param iri - The absolute IRI.
 * @returns The local name, or the whole IRI when it ends in a separator and
 *   so has none.
 */
export default function findLocalName(iri: string): string {
  const localName = iri.replace(THROUGH_LAST_SEPARATOR, "");
  return localName === "" ? iri : localName;
}
