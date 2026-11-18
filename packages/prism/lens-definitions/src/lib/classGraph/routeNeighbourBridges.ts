import { type PathCommand, requireAt } from "@canonical/prism-core";
import { BRIDGE_GAP_ROOM, SHELF_GAP } from "./constants.js";
import offsetLane from "./offsetLane.js";
import type { NeighbourBridgeEnds } from "./types.js";

/** A straight stretch of a route: its two ends. */
type Run = readonly [x1: number, y1: number, x2: number, y2: number];

/**
 * List the straight stretches of a route drawn with absolute `M`, `H` and
 * `V` commands.
 */
function listRuns(commands: readonly PathCommand[]): Run[] {
  const runs: Run[] = [];
  let x = 0;
  let y = 0;
  for (const [command, ...values] of commands) {
    const next = requireAt(values, values.length - 1);
    if (command === "H") runs.push([x, y, next, y]);
    if (command === "V") runs.push([x, y, x, next]);
    if (command === "M") x = requireAt(values, 0);
    if (command === "M" || command === "V") y = next;
    if (command === "H") x = next;
  }
  return runs;
}

/**
 * Whether two stretches lie on one horizontal or one vertical line and
 * overlap there by more than a point.
 */
function sharesLine(p: Run, q: Run): boolean {
  const overlaps = (a1: number, a2: number, b1: number, b2: number) =>
    Math.min(Math.max(a1, a2), Math.max(b1, b2)) >
    Math.max(Math.min(a1, a2), Math.min(b1, b2));
  const across = ([, y1, , y2]: Run): boolean => y1 === y2;
  if (across(p) !== across(q)) return false;
  // The coordinate the line keeps, and the one it runs along.
  const [line, along] = across(p) ? [1, 0] : [0, 1];
  return (
    p[line] === q[line] &&
    overlaps(p[along], p[along + 2], q[along], q[along + 2])
  );
}

/**
 * Order the straight routes' crossings of the gap from left to right so
 * that no route's run from the left region lies on another's run into the
 * right region: a route whose left port is at the height of another's
 * right port crosses before it. Ties keep the bridges' own order.
 *
 * @returns Each bridge's rank, or undefined when the order is circular,
 *   as for two bridges whose ports cross at the same two heights.
 */
function rankCrossings(
  bridges: readonly NeighbourBridgeEnds[],
  gapMiddle: number,
): number[] | undefined {
  const leftPort = ({ startX, portA, portB }: NeighbourBridgeEnds) =>
    startX < gapMiddle ? portA : portB;
  const rightPort = ({ startX, portA, portB }: NeighbourBridgeEnds) =>
    startX < gapMiddle ? portB : portA;
  const before = (i: number, j: number): boolean =>
    i !== j &&
    leftPort(requireAt(bridges, i)) === rightPort(requireAt(bridges, j));
  const ranks: number[] = Array.from({ length: bridges.length }, () => -1);
  for (let rank = 0; rank < bridges.length; rank += 1) {
    const next = bridges.findIndex(
      (_, j) =>
        ranks[j] === -1 &&
        bridges.every((__, i) => ranks[i] !== -1 || !before(i, j)),
    );
    if (next === -1) return undefined;
    ranks[next] = rank;
  }
  return ranks;
}

/**
 * Route the bridges between two regions side by side on one shelf, which
 * leave and enter by the sides that face across the gap between them,
 * each keeping a stretch of route of its own. They run straight across
 * the gap, each crossing it at a lane of its own, ordered so that no run
 * lies on another; where no order does that, they run over the shelf in
 * nested arches: each leaves on its own side of the gap's middle, rises
 * to a lane of the gap above the shelf, and comes down on the other side.
 *
 * @param bridges - Each bridge's ends: where it leaves and enters its
 *   boxes, in the order the lanes are numbered.
 * @param gap - The gap between the two regions, left to right.
 * @param shelfY - The top of the shelf the two regions stand on.
 * @returns Each bridge's route, in the order given.
 */
export default function routeNeighbourBridges(
  bridges: readonly NeighbourBridgeEnds[],
  gap: { readonly from: number; readonly to: number },
  shelfY: number,
): PathCommand[][] {
  const middle = (gap.from + gap.to) / 2;
  const count = bridges.length;
  const ranks =
    rankCrossings(bridges, middle) ?? bridges.map((_, index) => index);
  const straight = bridges.map(
    ({ startX, portA, endX, portB }, index): PathCommand[] => [
      ["M", startX, portA],
      [
        "H",
        middle + offsetLane(requireAt(ranks, index), count, BRIDGE_GAP_ROOM),
      ],
      ...(portA === portB ? [] : ([["V", portB]] as PathCommand[])),
      ["H", endX],
    ],
  );
  const runs = straight.map(listRuns);
  const clean = runs.every((own, index) =>
    runs
      .slice(index + 1)
      .every((other) =>
        own.every((run) => other.every((it) => !sharesLine(run, it))),
      ),
  );
  if (clean) return straight;
  // Nested arches: the verticals by the left region take the gap's left
  // half, those by the right region its right half, so no run from one
  // region lies on a run into the other; the outermost arch rises
  // highest.
  return bridges.map(({ startX, portA, endX, portB }, index) => {
    const left = middle + offsetLane(index, 2 * count, BRIDGE_GAP_ROOM);
    const right =
      middle + offsetLane(2 * count - 1 - index, 2 * count, BRIDGE_GAP_ROOM);
    const [exitX, entryX] = startX < middle ? [left, right] : [right, left];
    return [
      ["M", startX, portA],
      ["H", exitX],
      ["V", shelfY - SHELF_GAP / 2 + offsetLane(index, count, BRIDGE_GAP_ROOM)],
      ["H", entryX],
      ["V", portB],
      ["H", endX],
    ];
  });
}
