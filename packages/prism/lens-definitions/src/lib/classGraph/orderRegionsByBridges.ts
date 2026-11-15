import { compareText, orderBy, requireAt } from "@canonical/prism-core";
import type { Bridge, RegionSize } from "./types.js";

/**
 * Order the regions for the shelf packing: in an opened view the opened
 * namespace leads, so what the reader chose is what the page shows first;
 * then the collapsed namespaces' boxes, largest first, so a window of any
 * height opens on what is boxed; then the rest by their bridges, one at a time, the region with the most
 * relations to those already placed, so regions a reader follows a bridge
 * between sit next to each other. A stub with a bridge to a placed region
 * comes before any namespace, so it sits beside what its bridge leaves.
 * Ties go to the larger region, then to the prefix by code unit. Every
 * comparison is between integers or code units, so the order is the same
 * in every locale and whatever order the input is given in.
 *
 * @param regions - The regions with their sizes and what each draws.
 * @param bridges - The relations crossing between each pair of regions.
 * @param lead - The opened namespace's prefix, in an opened view; a prefix
 *   no region carries leads nothing.
 * @returns The regions' prefixes in packing order.
 */
export default function orderRegionsByBridges(
  regions: readonly RegionSize[],
  bridges: readonly Bridge[],
  lead?: string,
): readonly string[] {
  const bySize = (x: RegionSize, y: RegionSize): number =>
    orderBy(y.size - x.size, compareText(x.prefix, y.prefix));
  const opened = regions.filter((region) => region.prefix === lead);
  const boxes = regions
    .filter((region) => region.kind === "region" && region.prefix !== lead)
    .sort(bySize);
  const remaining = regions
    .filter((region) => region.kind !== "region" && region.prefix !== lead)
    .sort(bySize);
  const order = [...opened, ...boxes].map((region) => region.prefix);
  const placed = new Set(order);
  const pullOf = (prefix: string): number =>
    bridges.reduce(
      (sum, bridge) =>
        (bridge.a === prefix && placed.has(bridge.b)) ||
        (bridge.b === prefix && placed.has(bridge.a))
          ? sum + bridge.relations
          : sum,
      0,
    );
  // A stub drawn beside its partner outranks any namespace's pull.
  const rankOf = (region: RegionSize): readonly [number, number] => {
    const pull = pullOf(region.prefix);
    return [region.kind === "stub" && pull > 0 ? 1 : 0, pull];
  };
  while (remaining.length > 0) {
    const ranks = remaining.map(rankOf);
    // The remaining regions are by size, then prefix, so only a higher
    // rank displaces the first.
    const best = ranks.reduce((chosen, [stub, pull], index) => {
      const [chosenStub, chosenPull] = requireAt(ranks, chosen);
      return orderBy(stub - chosenStub, pull - chosenPull) > 0 ? index : chosen;
    }, 0);
    const next = requireAt(remaining.splice(best, 1), 0);
    placed.add(next.prefix);
    order.push(next.prefix);
  }
  return order;
}
