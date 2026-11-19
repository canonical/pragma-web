import { requireDefined } from "@canonical/prism-core";
import {
  BRIDGE_GAP_ROOM,
  BRIDGE_LANE,
  BRIDGE_LANE_MIN,
  SHELF_GAP,
} from "./constants.js";
import type { LaneChannel } from "./types.js";

/**
 * Choose the gap a bridge runs down past the shelves between its two
 * ends: of the free gaps between the regions those shelves hold, the
 * nearest to its way, measured from where it leaves to where it enters,
 * that still has room for its lane beside the lanes already there; else
 * the nearer of the packing's margins.
 *
 * A gap is free when no region on any of the shelves passed reaches into
 * it, and it holds `count + 1` lanes when they keep at least half a lane
 * apart within its room: the gap less a lane's clearance from the boxes
 * on either side.
 *
 * @param passed - The left and right edges of each region on the shelves
 *   passed, in px.
 * @param exit - Where the bridge comes from along the gap above, in px.
 * @param entry - Where it goes to along the gap below, in px.
 * @param margins - The packing's margins, left and right, in px.
 * @param taken - How many bridges already run down each gap, by its
 *   middle.
 * @returns The gap to run down, as a lane channel.
 */
export default function chooseShelfGap(
  passed: readonly { readonly left: number; readonly right: number }[],
  exit: number,
  entry: number,
  margins: readonly [left: number, right: number],
  taken: ReadonlyMap<number, number>,
): LaneChannel {
  const spans = [...passed].sort((a, b) => a.left - b.left);
  const gaps: LaneChannel[] = [];
  let reach = margins[0] + SHELF_GAP / 2;
  for (const span of spans) {
    if (span.left - reach >= SHELF_GAP) {
      gaps.push({
        base: (reach + span.left) / 2,
        room: span.left - reach - 2 * BRIDGE_LANE,
      });
    }
    reach = Math.max(reach, span.right);
  }
  const roomy = gaps.filter(
    ({ base, room }) => (taken.get(base) ?? 0) * BRIDGE_LANE_MIN <= room,
  );
  const detour = (base: number): number =>
    Math.abs(exit - base) + Math.abs(base - entry);
  const nearest = (candidates: readonly LaneChannel[]) =>
    candidates.reduce<LaneChannel | undefined>(
      (best, gap) =>
        best === undefined || detour(gap.base) < detour(best.base) ? gap : best,
      undefined,
    );
  return requireDefined(
    nearest(roomy) ??
      nearest(margins.map((base) => ({ base, room: BRIDGE_GAP_ROOM }))),
    "a gap past the shelves",
  );
}
