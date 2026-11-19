import { VIEW_PARAMS } from "@canonical/prism-core";

/** The address parameters the view itself owns; no facet takes their names. */
const VIEW_PARAM_NAMES: ReadonlySet<string> = new Set(
  Object.values(VIEW_PARAMS),
);

/**
 * Select the names of the address's parameters that can apply a facet:
 * every parameter with a value that the view does not own. The index does
 * not know its facets before the graph answers, so it treats each such
 * parameter as a field's served name and the provider ignores a name no
 * facet holds.
 *
 * @param search - The address's parameters by name.
 * @returns The candidate facet names, in the address's order.
 */
export default function selectFacetParams(search: object): readonly string[] {
  return Object.entries(search)
    .filter(
      ([name, value]) =>
        !VIEW_PARAM_NAMES.has(name) &&
        typeof value === "string" &&
        value !== "",
    )
    .map(([name]) => name);
}
