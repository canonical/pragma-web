import { orderBy, requireAt, requireEntry } from "@canonical/prism-core";
import { LANE_ORDER_SEARCH_LIMIT } from "./constants.js";
import offsetLane from "./offsetLane.js";
import type { LaneRoute } from "./types.js";

/**
 * A route's runs along one channel: the route, and which of its channels
 * lie there. A route's runs along one channel keep one lane.
 */
interface ChannelRun {
  readonly route: number;
  readonly indices: readonly number[];
}

/**
 * A coordinate along a channel where a run ends or turns off it, and
 * whether it is settled: a port, or a lane already numbered.
 */
interface ChannelPoint {
  readonly at: number;
  readonly settled: boolean;
}

/**
 * Where a route's runs lie along their channel, and where the runs before
 * and after them turn off it, each with the side it turns to (-1 towards
 * the channel's lesser coordinate, 1 towards the greater, 0 straight on).
 */
interface RunSpan {
  readonly from: ChannelPoint;
  readonly to: ChannelPoint;
  readonly turns: readonly (ChannelPoint & { readonly side: number })[];
}

/**
 * What a turn does to a run whose lane it passes across: `[1, 0]` where
 * it meets the run's own end, settled on both sides, and so runs on its
 * line for a stretch; `[0, 1]` where it crosses the run; `[0, 0]` where it
 * misses it, or meets an end not yet settled, which a later numbering
 * moves apart.
 */
function meetRun(turn: ChannelPoint, span: RunSpan): readonly [number, number] {
  for (const end of [span.from, span.to]) {
    if (turn.at === end.at)
      return turn.settled && end.settled ? [1, 0] : [0, 0];
  }
  return turn.at > span.from.at && turn.at < span.to.at ? [0, 1] : [0, 0];
}

/**
 * Weigh two runs of one channel when `lower` takes the lane of lesser
 * coordinate, as the stretches they share and the crossings they make: a
 * turn of the lower run towards the greater side passes across the upper
 * run's lane, and a turn of the upper run towards the lesser side across
 * the lower run's.
 */
function weighPair(lower: RunSpan, upper: RunSpan): readonly [number, number] {
  const meetings = [
    ...lower.turns.flatMap((turn) =>
      turn.side > 0 ? [meetRun(turn, upper)] : [],
    ),
    ...upper.turns.flatMap((turn) =>
      turn.side < 0 ? [meetRun(turn, lower)] : [],
    ),
  ];
  return [
    meetings.reduce((sum, [shared]) => sum + shared, 0),
    meetings.reduce((sum, [, crossed]) => sum + crossed, 0),
  ];
}

/** Every order of `items`, in the lexicographic order of their places. */
function listOrders<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]];
  return items.flatMap((item, index) =>
    listOrders([...items.slice(0, index), ...items.slice(index + 1)]).map(
      (rest) => [item, ...rest],
    ),
  );
}

/**
 * Number the lanes of bridges' routes per channel: every route that runs
 * along a channel beside a column, a gap between regions or shelves, or a
 * margin takes a lane of its own there, whatever pair of regions it
 * joins, so no two bridges share a stretch of line. The down runs are
 * numbered first on their ports alone, then the across runs on those
 * lanes, then the down runs again on the across lanes they meet. In each
 * channel the lanes are ordered so the turns into and out of it run on no
 * other run's line (two ports at one height, on boxes either side of a
 * gap, each keep the lane nearer their own box), then so they cross the
 * fewest of its other runs (an arch over a shelf runs above every arch it
 * spans; routes that turn the same corner nest), trying every order of a
 * channel of up to `LANE_ORDER_SEARCH_LIMIT` routes and keeping the first
 * best; a fuller channel keeps the order its runs start along it. The
 * lanes spread about the channel's middle within the least room of its
 * runs, `BRIDGE_LANE` apart where it has the room, closer where it does
 * not: beside a column (8px of room) three lanes keep 4px apart, a fourth
 * runs 2px from its neighbour, and from six they lie on one line; in a
 * gap or a margin (32px) five keep 8px apart and nine 4px.
 *
 * @param routes - Each bridge's route, its channels at their middles.
 * @returns Each route's channels' coordinates, its lanes numbered.
 */
export default function numberChannelLanes(
  routes: readonly LaneRoute[],
): number[][] {
  const lanes = routes.map(({ channels }) =>
    channels.map((channel) => channel.base),
  );
  const numbered = new Set<number>();
  // A route's coordinates in drawing order: its start's x and y, each
  // channel's lane, its end's y and x, alternately across and down; a
  // channel's lane is settled once a pass across its parity has run.
  const pointAt = (route: number, place: number): ChannelPoint => {
    const { start, end, channels } = requireAt(routes, route);
    const coordinates = [...start, ...requireAt(lanes, route), end[1], end[0]];
    const index = place - 2;
    return {
      at: requireAt(coordinates, place),
      settled: index < 0 || index >= channels.length || numbered.has(index % 2),
    };
  };
  const measureSpan = ({ route, indices }: ChannelRun): RunSpan => {
    const spans = indices.map((index): RunSpan => {
      const point = (offset: number): ChannelPoint =>
        pointAt(route, index + 2 + offset);
      const lane = point(0).at;
      const [before, after] = [point(-1), point(1)];
      return {
        from: before.at <= after.at ? before : after,
        to: before.at <= after.at ? after : before,
        turns: [
          { ...before, side: Math.sign(point(-2).at - lane) },
          { ...after, side: Math.sign(point(2).at - lane) },
        ],
      };
    });
    const ends = spans.flatMap(({ from, to }) => [from, to]);
    return {
      from: ends.reduce((least, end) => (end.at < least.at ? end : least)),
      to: ends.reduce((most, end) => (end.at > most.at ? end : most)),
      turns: spans.flatMap(({ turns }) => turns),
    };
  };
  for (const parity of [0, 1, 0]) {
    const channels = new Map<number, ChannelRun[]>();
    routes.forEach(({ channels: route }, routeIndex) => {
      for (const base of new Set(route.map((channel) => channel.base))) {
        const indices = route.flatMap((channel, index) =>
          channel.base === base && index % 2 === parity ? [index] : [],
        );
        if (indices.length === 0) continue;
        channels.set(base, [
          ...(channels.get(base) ?? []),
          { route: routeIndex, indices },
        ]);
      }
    });
    const numbering = [...channels.entries()]
      .sort(([a], [b]) => a - b)
      .map(([base, runs]): [number, readonly ChannelRun[]] => {
        const spans = new Map(runs.map((run) => [run, measureSpan(run)]));
        const spanOf = (run: ChannelRun): RunSpan => requireEntry(spans, run);
        const started = [...runs].sort((x, y) =>
          orderBy(
            spanOf(x).from.at - spanOf(y).from.at,
            spanOf(x).to.at - spanOf(y).to.at,
            x.route - y.route,
          ),
        );
        // An order's weight: the stretches its runs share, then their
        // crossings.
        const weighOrder = (
          order: readonly ChannelRun[],
        ): readonly [number, number] =>
          order.reduce<readonly [number, number]>(
            (weight, lower, rank) =>
              order.slice(rank + 1).reduce((sum, upper) => {
                const [shared, crossed] = weighPair(
                  spanOf(lower),
                  spanOf(upper),
                );
                return [sum[0] + shared, sum[1] + crossed];
              }, weight),
            [0, 0],
          );
        const isLighter = (
          candidate: readonly ChannelRun[],
          best: readonly ChannelRun[],
        ): boolean => {
          const [shared, crossed] = weighOrder(candidate);
          const [bestShared, bestCrossed] = weighOrder(best);
          return orderBy(shared - bestShared, crossed - bestCrossed) < 0;
        };
        return [
          base,
          started.length > LANE_ORDER_SEARCH_LIMIT
            ? started
            : listOrders(started).reduce((best, candidate) =>
                isLighter(candidate, best) ? candidate : best,
              ),
        ];
      });
    for (const [base, order] of numbering) {
      const room = Math.min(
        ...order.flatMap(({ route, indices }) =>
          indices.map(
            (index) => requireAt(requireAt(routes, route).channels, index).room,
          ),
        ),
      );
      order.forEach(({ route, indices }, rank) => {
        for (const index of indices) {
          requireAt(lanes, route)[index] =
            base + offsetLane(rank, order.length, room);
        }
      });
    }
    numbered.add(parity);
  }
  return lanes;
}
