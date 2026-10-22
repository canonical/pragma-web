import { DOT_RADIUS, INTERCHANGE_RADIUS } from "./constants.js";
import placeLabel from "./placeLabel.js";
import type { DiagramStop, DrawingPoint, StationMark } from "./types.js";

/**
 * Build a station's mark from the points where its tracks pass it: a dot
 * where one track passes a plain station, and otherwise a capsule, a box
 * around every track's point rounded at its ends, so tracks running side by
 * side pass through one mark. An interchange always takes a capsule, larger
 * than a dot, even where its lines cross at one point.
 *
 * @param stop - The station.
 * @param points - Where each track passes it.
 * @param tracks - The unit directions the tracks leave it in.
 * @returns The mark and its label.
 * @throws When no track passes the station.
 */
export default function buildStationMark(
  stop: DiagramStop,
  points: readonly DrawingPoint[],
  tracks: readonly DrawingPoint[],
): StationMark {
  if (points.length === 0) {
    throw new Error(`no track passes ${stop.uri}`);
  }
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const isCapsule = stop.isInterchange || points.length > 1;
  const radius = stop.isInterchange ? INTERCHANGE_RADIUS : DOT_RADIUS;
  const x = Math.min(...xs) - radius;
  const y = Math.min(...ys) - radius;
  const width = Math.max(...xs) + radius - x;
  const height = Math.max(...ys) + radius - y;
  return {
    stop,
    shape: isCapsule ? "capsule" : "dot",
    x,
    y,
    width,
    height,
    radius,
    label: placeLabel(
      { x: x + width / 2, y: y + height / 2 },
      width / 2,
      height / 2,
      tracks,
    ),
  };
}
