import { requireEntry } from "../../classGraph/require.js";
import type { ClassGraphLayout } from "../../classGraph/types.js";
import { matchesChips, matchesDimming } from "../../lensFilter.js";
import type { LensFilter } from "../../types.js";

/**
 * Sort the graph's classes by the filter: hidden where a chip leaves them
 * out (abstraction or ontology), dimmed where the search or the instances
 * axis leaves them out. Hiding and dimming never move anything: the layout
 * stays as it is.
 *
 * @param layout - The class graph's layout.
 * @param terms - Each class's compact term, by IRI.
 * @param filter - The resolved filter.
 * @returns The hidden and the dimmed classes, by IRI.
 */
export default function classifyClasses(
  layout: ClassGraphLayout,
  terms: ReadonlyMap<string, string>,
  filter: LensFilter,
): {
  readonly hidden: ReadonlySet<string>;
  readonly dimmed: ReadonlySet<string>;
} {
  const hidden = new Set<string>();
  const dimmed = new Set<string>();
  for (const node of layout.nodes.values()) {
    if (!matchesChips(filter, node.abstract, node.region)) hidden.add(node.uri);
    const term = requireEntry(terms, node.uri);
    if (!matchesDimming(filter, node.label, term, node.instanceCount)) {
      dimmed.add(node.uri);
    }
  }
  return { hidden, dimmed };
}
