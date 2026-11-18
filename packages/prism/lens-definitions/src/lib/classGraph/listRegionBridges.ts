import {
  compareText,
  orderBy,
  requireAt,
  requireEntry,
} from "@canonical/prism-core";
import type { Bridge, ClassGraphModel } from "./types.js";

/**
 * List the bridges between the graph's regions: for each pair of regions
 * some relation crosses between, how many relations do, by the pair's
 * prefixes in code-unit order.
 *
 * @param model - The class graph's model.
 * @returns The bridges, by their first prefix, then their second.
 */
export default function listRegionBridges(
  model: ClassGraphModel,
): readonly Bridge[] {
  const prefixOf = (uri: string): string =>
    requireEntry(model.byId, uri).prefix;
  const counts = new Map<string, Bridge>();
  for (const bundle of model.bundles.filter((candidate) => candidate.cross)) {
    const ends = [prefixOf(bundle.a), prefixOf(bundle.b)].sort(compareText);
    const a = requireAt(ends, 0);
    const b = requireAt(ends, 1);
    const key = `${a} ${b}`;
    counts.set(key, {
      a,
      b,
      relations: (counts.get(key)?.relations ?? 0) + bundle.relations.length,
    });
  }
  return [...counts.values()].sort((x, y) =>
    orderBy(compareText(x.a, y.a), compareText(x.b, y.b)),
  );
}
