import { formatPathData } from "./geometry.js";
import { requireDefined, requireEntry } from "./require.js";
import type { ClassGraphLayout } from "./types.js";

/**
 * Trace the subclass bus segments from a selected class up to its root:
 * each hop from the class's left side along its parent's bus to the
 * parent's right side, drawn over the buses so the lineage reads at a
 * glance.
 *
 * @param layout - The class graph's layout.
 * @param id - The selected class's IRI.
 * @returns One path per hop, nearest first.
 */
export default function traceChainToRoot(
  layout: ClassGraphLayout,
  id: string,
): { readonly from: string; readonly to: string; readonly d: string }[] {
  const hops: { from: string; to: string; d: string }[] = [];
  let current = id;
  for (
    let parent = layout.model.parent.get(current);
    parent !== undefined;
    parent = layout.model.parent.get(current)
  ) {
    const bus = layout.edges.find((edge) => edge.id === `sub:${parent}`);
    const child = requireEntry(layout.nodes, current);
    const above = requireEntry(layout.nodes, parent);
    const childY = child.y + child.h / 2;
    const parentY = above.y + above.h / 2;
    const busX = requireDefined(bus?.busX, `bus of ${parent}`);
    hops.push({
      from: parent,
      to: current,
      d: formatPathData([
        ["M", child.x, childY],
        ["H", busX],
        ["V", parentY],
        ["H", above.x + above.w],
      ]),
    });
    current = parent;
  }
  return hops;
}
