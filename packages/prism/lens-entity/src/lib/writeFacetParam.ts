import compactIri from "./compactIri.js";
import { FACET_NONE, FACET_VALUE_SEPARATOR } from "./constants.js";
import type { OntologyNamespace } from "./types.js";

/**
 * Write a facet's applied values as its address parameter: each value a
 * curie where the site's prefixes give one, the full IRI otherwise, the
 * "none" bucket as `none`, separated by commas.
 *
 * @param values - The applied values; `null` is the "none" bucket.
 * @param namespaces - The site's prefixes.
 * @returns The parameter's text, or `undefined` when nothing is applied.
 */
export default function writeFacetParam(
  values: readonly (string | null)[],
  namespaces: readonly OntologyNamespace[],
): string | undefined {
  if (values.length === 0) return undefined;
  return values
    .map((value) =>
      value === null ? FACET_NONE : compactIri(value, namespaces),
    )
    .join(FACET_VALUE_SEPARATOR);
}
