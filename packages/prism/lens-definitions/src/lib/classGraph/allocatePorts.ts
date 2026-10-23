import { PORT_LEVELS } from "./constants.js";
import { requireAt } from "./require.js";

/** A line already fixed on a box's side: a subclass tick or a loop's end. */
export interface FixedPort {
  readonly kind: "tick" | "loop";
  /** Its offset from the box's top, in px. */
  readonly y: number;
}

/** The ports a side was given and the spacing level it needed. */
export interface PortAllocation {
  /** Each request's offset from the box's top, in the requests' order. */
  readonly ys: readonly number[];
  /** The index of the level in `PORT_LEVELS` the side needed. */
  readonly level: number;
}

/**
 * Allocate a box side's relation ports: the requests, already ordered by
 * the other end's height, take ordered slots on the 4px grid, at least 8px
 * from the corners, 4px apart and clear of the fixed lines (8px from the
 * subclass tick, 4px on a hub), keeping the total distance from each
 * request's ideal offset smallest. A side that cannot hold its ports at a
 * level tries the next; a hub starts at the hub clearance.
 *
 * @param height - The box's height, in px.
 * @param fixed - The lines already on the side.
 * @param ideals - Each request's ideal offset from the top, in order.
 * @param hub - Whether the box is a hub.
 * @returns The ports' offsets and the level used.
 * @throws When no level holds the ports.
 */
export default function allocatePorts(
  height: number,
  fixed: readonly FixedPort[],
  ideals: readonly number[],
  hub: boolean,
): PortAllocation {
  if (ideals.length === 0) return { ys: [], level: 0 };
  for (let level = hub ? 1 : 0; level < PORT_LEVELS.length; level += 1) {
    const { corner, tick, spacing } = requireAt(PORT_LEVELS, level);
    const slots: number[] = [];
    for (let at = corner; at <= height - corner; at += spacing) {
      const clear = fixed.every(
        (line) =>
          Math.abs(at - line.y) >= (line.kind === "tick" ? tick : spacing),
      );
      if (clear) slots.push(at);
    }
    const n = ideals.length;
    const m = slots.length;
    if (m < n) continue;
    const targets = ideals.map((ideal) =>
      Math.min(height - corner, Math.max(corner, ideal)),
    );
    // cost[i][j]: the least total distance placing the first i requests in
    // the first j slots, in order.
    const cost = Array.from({ length: n + 1 }, () =>
      new Array<number>(m + 1).fill(Number.POSITIVE_INFINITY),
    );
    const row = (i: number): number[] => requireAt(cost, i);
    row(0).fill(0);
    for (let i = 1; i <= n; i += 1) {
      for (let j = i; j <= m; j += 1) {
        row(i)[j] = Math.min(
          requireAt(row(i), j - 1),
          requireAt(row(i - 1), j - 1) +
            Math.abs(requireAt(slots, j - 1) - requireAt(targets, i - 1)),
        );
      }
    }
    const ys = new Array<number>(n);
    let j = m;
    for (let i = n; i >= 1; i -= 1) {
      while (j > i && requireAt(row(i), j) === requireAt(row(i), j - 1)) {
        j -= 1;
      }
      ys[i - 1] = requireAt(slots, j - 1);
      j -= 1;
    }
    return { ys, level };
  }
  throw new Error(
    `no port allocation holds ${ideals.length} ports on a ${height}px side`,
  );
}
