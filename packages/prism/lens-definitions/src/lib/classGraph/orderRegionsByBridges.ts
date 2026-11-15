import { compareText, orderBy, requireAt } from "@canonical/prism-core";
import type { Bridge, RegionSize } from "./types.js";

/**
 * Order the regions for the shelf packing by their bridges: the largest
 * first, then, one at a time, the region with the most relations to those
 * already placed, so regions a reader follows a bridge between sit next to
 * each other. Ties go to the larger region, then to the prefix by code
 * unit. Every comparison is between integers or code units, so the order
 * is the same in every locale and whatever order the input is given in.
 *
 * @param regions - The regions with their sizes.
 * @param bridges - The relations crossing between each pair of regions.
 * @returns The regions' prefixes in packing order.
 */
export default function orderRegionsByBridges(
  regions: readonly RegionSize[],
  bridges: readonly Bridge[],
): readonly string[] {
  const remaining = [...regions].sort((x, y) =>
    orderBy(y.size - x.size, compareText(x.prefix, y.prefix)),
  );
  const placed = new Set<string>();
  const order: string[] = [];
  const pullOf = (prefix: string): number =>
    bridges.reduce(
      (sum, bridge) =>
        (bridge.a === prefix && placed.has(bridge.b)) ||
        (bridge.b === prefix && placed.has(bridge.a))
          ? sum + bridge.relations
          : sum,
      0,
    );
  while (remaining.length > 0) {
    const pulls = remaining.map((region) => pullOf(region.prefix));
    // The remaining regions are by size, then prefix, so only a stronger
    // pull displaces the first.
    const best = pulls.reduce(
      (chosen, pull, index) => (pull > requireAt(pulls, chosen) ? index : chosen),
      0,
    );
    const next = requireAt(remaining.splice(best, 1), 0);
    placed.add(next.prefix);
    order.push(next.prefix);
  }
  return order;
}
