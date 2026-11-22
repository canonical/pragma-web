import type { FacetFilter } from "@canonical/prism-contract";
import { findCuriePrefix } from "@canonical/prism-projections";
import { FACET_NONE, FACET_VALUE_SEPARATOR } from "./constants.js";
import expandAddress from "./expandAddress.js";
import type { OntologyNamespace } from "./types.js";

/**
 * Read the facet filters an address applies: one per field whose served
 * name is a parameter, its values separated by commas, `none` standing for
 * the "none" bucket. A value is a curie where the site's prefixes give one
 * (`findCuriePrefix`), expanded to its IRI, or a full IRI, kept.
 *
 * @param search - The address's parameters by name.
 * @param fields - The served names of the facets the lens offers.
 * @param namespaces - The site's prefixes.
 * @returns The filters, in the fields' order.
 */
export default function readFacetParams(
  search: object,
  fields: readonly string[],
  namespaces: readonly OntologyNamespace[],
): readonly FacetFilter[] {
  return fields.flatMap((field) => {
    const text: unknown = Reflect.get(search, field);
    if (typeof text !== "string" || text === "") return [];
    const values = text
      .split(FACET_VALUE_SEPARATOR)
      .filter((value) => value !== "")
      .map((value) => {
        if (value === FACET_NONE) return null;
        return findCuriePrefix(value) === undefined
          ? value
          : expandAddress(value, namespaces);
      });
    return values.length === 0 ? [] : [{ field, values }];
  });
}
