import { requireEntry } from "@canonical/prism-core";
import type { ClassGraphLayout } from "../../classGraph/types.js";
import { matchesChips, matchesDimming } from "../../lensFilter.js";
import type { LensFilter } from "../../types.js";

/**
 * Sort the graph's classes by the filter: hidden where a chip leaves them
 * out (abstraction or ontology), dimmed where the search or the instances
 * axis leaves them out. Hiding and dimming never move anything: the layout
 * stays as it is. A stub is never hidden, as it lies in no namespace a
 * chip names, and a collapsed region follows its namespace's chip alone.
 * A collapsed region is dimmed only when none of the classes it stands for
 * matches the search and the instances axis.
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
  const boxedOf = new Map(
    layout.regions.map((region) => [region.prefix, region.boxed]),
  );
  for (const node of layout.nodes.values()) {
    // A stub lies in no namespace the chips name; a collapsed region
    // follows its namespace's chip alone.
    const shown =
      node.kind === "stub" ||
      (node.kind === "region"
        ? filter.namespaces.includes(node.region)
        : matchesChips(filter, node.abstract, node.region));
    if (!shown) hidden.add(node.uri);
    // A box is lit while any class it stands for matches.
    const matches =
      node.kind === "region"
        ? requireEntry(boxedOf, node.region).some((klass) =>
            matchesDimming(
              filter,
              klass.label,
              requireEntry(terms, klass.uri),
              klass.instanceCount,
            ),
          )
        : matchesDimming(
            filter,
            node.label,
            node.term ?? requireEntry(terms, node.uri),
            node.instanceCount,
          );
    if (!matches) dimmed.add(node.uri);
  }
  return { hidden, dimmed };
}
