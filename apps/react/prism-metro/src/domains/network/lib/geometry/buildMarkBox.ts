import { DOT_RADIUS, INTERCHANGE_RADIUS } from "./constants.js";
import type { DiagramStop, DrawingPoint, MarkBox } from "./types.js";

/**
 * Measure a station's mark from the points where its tracks pass it: a dot
 * where one track passes a plain station, and otherwise a capsule, a box
 * around every track's point rounded at its ends, so tracks running side by
 * side pass through one mark. An interchange always takes a capsule, larger
 * than a dot, even where its lines cross at one point.
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
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const radius = stop.isInterchange ? INTERCHANGE_RADIUS : DOT_RADIUS;
  const x = Math.min(...xs) - radius;
  const y = Math.min(...ys) - radius;
  return {
    stop,
    shape: stop.isInterchange || points.length > 1 ? "capsule" : "dot",
    x,
    y,
    width: Math.max(...xs) + radius - x,
    height: Math.max(...ys) + radius - y,
    radius,
  };
}
