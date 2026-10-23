import { DOT_RADIUS, GRID_UNIT, INTERCHANGE_RADIUS } from "./constants.js";
import type { DiagramStop, DrawingPoint, MarkBox } from "./types.js";

/**
 * Measure a station's mark from the points where its tracks pass it: a dot
 * where one track passes a plain station, and otherwise a capsule rounded at
 * its ends, so tracks running side by side pass through one mark. An
 * interchange always takes a capsule, larger than a dot, even where its
 * lines cross at one point. Every mark is centred on its station's lattice
 * dot and reaches as far either side as its furthest track.
 *
 * @param stop - The station.
 * @param points - Where each track passes it.
 * @returns The mark's shape, box and corner radius.
 * @throws When no track passes the station.
 */
export default function buildMarkBox(
  stop: DiagramStop,
  points: readonly DrawingPoint[],
): MarkBox {
  if (points.length === 0) {
    throw new Error(`no track passes ${stop.uri}`);
  }
  const centre = {
    x: stop.position.x * GRID_UNIT,
    y: stop.position.y * GRID_UNIT,
  };
  const radius = stop.isInterchange ? INTERCHANGE_RADIUS : DOT_RADIUS;
  const reachX = Math.max(
    ...points.map((point) => Math.abs(point.x - centre.x)),
  );
  const reachY = Math.max(
    ...points.map((point) => Math.abs(point.y - centre.y)),
  );
  return {
    stop,
    shape: stop.isInterchange || points.length > 1 ? "capsule" : "dot",
    x: centre.x - reachX - radius,
    y: centre.y - reachY - radius,
    width: 2 * (reachX + radius),
    height: 2 * (reachY + radius),
    radius,
  };
}
