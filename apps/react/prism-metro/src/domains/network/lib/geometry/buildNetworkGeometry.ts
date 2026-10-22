import assignTrackOffsets from "./assignTrackOffsets.js";
import buildStationMark from "./buildStationMark.js";
import formatTrackPath from "./formatTrackPath.js";
import measureViewBox from "./measureViewBox.js";
import offsetRoute from "./offsetRoute.js";
import selectDrawnRoutes from "./selectDrawnRoutes.js";
import type {
  DiagramLine,
  DiagramStop,
  DrawingPoint,
  NetworkGeometry,
  Track,
} from "./types.js";

/** What the drawn tracks say about one station. */
interface StationPassage {
  readonly stop: DiagramStop;
  readonly points: DrawingPoint[];
  readonly tracks: DrawingPoint[];
}

/**
 * Build everything the schematic map draws from the network's lines: one
 * track per line route and its reverse, offset so lines sharing a stretch run
 * side by side, and one mark per station the tracks pass, with its label.
 * The drawing is in SVG user units, the viewBox fitted around it.
 *
 * @param lines - The lines, with their routes and their stops' positions.
 * @returns The tracks, the marks and the viewBox.
 * @throws When there is no line to draw, or a route has fewer than two stops.
 */
export default function buildNetworkGeometry(
  lines: readonly DiagramLine[],
): NetworkGeometry {
  const drawn = lines.map((line) => ({
    ...line,
    routes: selectDrawnRoutes(line.routes),
  }));
  const offsets = assignTrackOffsets(drawn);
  const tracks: Track[] = [];
  const vertices: DrawingPoint[] = [];
  const passages = new Map<string, StationPassage>();
  for (const line of drawn) {
    for (const route of line.routes) {
      const offset = offsetRoute(route, line.uri, offsets);
      tracks.push({
        lineUri: line.uri,
        lineTitle: line.title,
        colour: line.colour,
        routeLabel: route.label,
        path: formatTrackPath(offset.points, offset.closed),
      });
      vertices.push(...offset.points);
      for (const stop of route.stops) {
        const passage = passages.get(stop.uri) ?? {
          stop,
          points: [],
          tracks: [],
        };
        // `offsetRoute` places and directs every stop of the route it offsets.
        passage.points.push(offset.stops.get(stop.uri) as DrawingPoint);
        passage.tracks.push(
          ...(offset.directions.get(stop.uri) as readonly DrawingPoint[]),
        );
        passages.set(stop.uri, passage);
      }
    }
  }
  const marks = [...passages.values()].map(({ stop, points, tracks }) =>
    buildStationMark(stop, points, tracks),
  );
  const corners = marks.flatMap(({ x, y, width, height }) => [
    { x, y },
    { x: x + width, y: y + height },
  ]);
  return {
    viewBox: measureViewBox([...vertices, ...corners]),
    tracks,
    marks,
  };
}
