import buildOctilinearPath from "./buildOctilinearPath.js";
import collectSegments from "./collectSegments.js";
import { GRID_UNIT } from "./constants.js";
import type {
  DiagramRoute,
  DrawingPoint,
  GridPoint,
  OffsetRoute,
} from "./types.js";

/** One straight leg of a route's drawn path, with its line's offset. */
interface Leg {
  readonly from: GridPoint;
  readonly to: GridPoint;
  /** The unit direction of travel. */
  readonly direction: DrawingPoint;
  /** The unit normal of the direction of travel, turning right on screen. */
  readonly normal: DrawingPoint;
  /** The line's offset along that normal. */
  readonly offset: number;
  /** The stop the leg leaves, when it starts at one rather than at a bend. */
  readonly fromStop?: string;
  /** The stop the leg reaches, when it ends at one rather than at a bend. */
  readonly toStop?: string;
}

/** Scale a grid point into the drawing. */
const scalePoint = ({ x, y }: GridPoint): DrawingPoint => ({
  x: x * GRID_UNIT,
  y: y * GRID_UNIT,
});

/**
 * Place the vertex where `incoming` meets `outgoing`. With one offset on
 * both legs the vertex is mitred, so a track keeps its distance from the
 * centre line through the turn; where the offset changes, as a line joins or
 * leaves a shared stretch, the two offset ends are averaged.
 */
const placeJoin = (incoming: Leg, outgoing: Leg): DrawingPoint => {
  const centre = scalePoint(outgoing.from);
  const a = incoming.normal;
  const b = outgoing.normal;
  if (incoming.offset === outgoing.offset) {
    const mx = a.x + b.x;
    const my = a.y + b.y;
    const length = Math.hypot(mx, my);
    const reach = (incoming.offset * length) / (mx * a.x + my * a.y);
    return {
      x: centre.x + (mx / length) * reach,
      y: centre.y + (my / length) * reach,
    };
  }
  return {
    x: centre.x + (a.x * incoming.offset + b.x * outgoing.offset) / 2,
    y: centre.y + (a.y * incoming.offset + b.y * outgoing.offset) / 2,
  };
};

/** Place an open end of a route: its grid point pushed out along the one leg's normal. */
const placeEnd = (vertex: GridPoint, leg: Leg): DrawingPoint => {
  const centre = scalePoint(vertex);
  return {
    x: centre.x + leg.normal.x * leg.offset,
    y: centre.y + leg.normal.y * leg.offset,
  };
};

/**
 * Break a route into its legs: each segment between stops becomes its
 * octilinear legs, each carrying the line's offset on that segment.
 */
const collectLegs = (
  route: DiagramRoute,
  lineUri: string,
  offsets: ReadonlyMap<string, ReadonlyMap<string, number>>,
): readonly Leg[] =>
  collectSegments(route).flatMap((segment) => {
    const { start, end } = segment;
    const offset = offsets.get(segment.key)?.get(lineUri);
    if (offset === undefined) {
      throw new Error(`no offset for ${lineUri} on ${segment.key}`);
    }
    // Offsets are measured along the canonical direction's normal; a leg run
    // the other way has the opposite normal, so the sign flips.
    const signed = segment.from === start ? offset : -offset;
    const path = buildOctilinearPath(start.position, end.position);
    return path.slice(1).map((to, legIndex): Leg => {
      const from = path.at(legIndex) as GridPoint;
      const length = Math.hypot(to.x - from.x, to.y - from.y);
      const direction = {
        x: (to.x - from.x) / length,
        y: (to.y - from.y) / length,
      };
      return {
        from,
        to,
        direction,
        normal: { x: -direction.y, y: direction.x },
        offset: signed,
        fromStop: legIndex === 0 ? start.uri : undefined,
        toStop: legIndex === path.length - 2 ? end.uri : undefined,
      };
    });
  });

/**
 * Offset one drawn route of a line onto its track: each leg pushed out by the
 * line's offset on its segment, and each vertex placed where the offset legs
 * meet. A loop is closed through its first stop, so it has no open end.
 *
 * @param route - The route, with at least two stops.
 * @param lineUri - The line the route belongs to.
 * @param offsets - Every line's offset, by segment key and line IRI.
 * @returns The track's vertices, where it passes each stop, and the
 *   directions its legs leave each stop in.
 * @throws When the route has fewer than two stops, or a segment carries no
 *   offset for the line.
 */
export default function offsetRoute(
  route: DiagramRoute,
  lineUri: string,
  offsets: ReadonlyMap<string, ReadonlyMap<string, number>>,
): OffsetRoute {
  if (route.stops.length < 2) {
    throw new Error(`route "${route.label}" needs two stops to be drawn`);
  }
  const legs = collectLegs(route, lineUri, offsets);
  const first = legs.at(0) as Leg;
  const last = legs.at(-1) as Leg;
  const closed = last.toStop === first.fromStop;
  const points = legs.map((leg, index) =>
    index === 0 && !closed
      ? placeEnd(leg.from, leg)
      : placeJoin(legs.at(index - 1) as Leg, leg),
  );
  if (!closed) points.push(placeEnd(last.to, last));

  const stops = new Map<string, DrawingPoint>();
  const directions = new Map<string, DrawingPoint[]>();
  const addDirection = (uri: string, direction: DrawingPoint): void => {
    directions.set(uri, [...(directions.get(uri) ?? []), direction]);
  };
  legs.forEach((leg, index) => {
    if (leg.fromStop !== undefined) {
      stops.set(leg.fromStop, points.at(index) as DrawingPoint);
      addDirection(leg.fromStop, leg.direction);
    }
    if (leg.toStop !== undefined) {
      addDirection(leg.toStop, { x: -leg.direction.x, y: -leg.direction.y });
    }
  });
  if (!closed) stops.set(last.toStop as string, points.at(-1) as DrawingPoint);
  return { points, closed, stops, directions };
}
