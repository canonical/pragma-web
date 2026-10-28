import assignTrackOffsets from "./assignTrackOffsets.js";
import buildMarkBox from "./buildMarkBox.js";
import formatTrackPath from "./formatTrackPath.js";
import measureViewBox from "./measureViewBox.js";
import offsetRoute from "./offsetRoute.js";
import placeLabel from "./placeLabel.js";
import selectDrawnRoutes from "./selectDrawnRoutes.js";
import type {
  Box,
  DiagramLine,
  DiagramStop,
  DrawingPoint,
  NetworkGeometry,
  StationMark,
  Track,
  TrackSegment,
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
 * side by side, and one mark per station the tracks pass, with its name
 * placed clear of every other mark and name and, where it can be, of every
 * track.
 * The drawing is in SVG user units, the viewBox fitted around the tracks,
 * the marks and the names.
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
  const segments: TrackSegment[] = [];
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
      const ends = offset.closed
        ? [...offset.points, offset.points.at(0) as DrawingPoint]
        : offset.points;
      segments.push(
        ...ends
          .slice(1)
          .map(
            (end, index): TrackSegment => [ends.at(index) as DrawingPoint, end],
          ),
      );
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
  // Every mark is measured before any name is placed, so no name lands on
  // a mark; names are then placed in the network's order, each avoiding the
  // ones before it, so the same network always reads the same way.
  const measured = [...passages.values()].map(({ stop, points, tracks }) => ({
    box: buildMarkBox(stop, points),
    tracks,
  }));
  const placed: Box[] = [];
  const marks = measured.map(({ box, tracks }): StationMark => {
    const others = measured
      .map((each) => each.box)
      .filter((other) => other !== box);
    const label = placeLabel(box, tracks, [...others, ...placed], segments);
    placed.push(label.box);
    return { ...box, label };
  });
  const corners = [...marks, ...placed].flatMap(({ x, y, width, height }) => [
    { x, y },
    { x: x + width, y: y + height },
  ]);
  return {
    viewBox: measureViewBox([...vertices, ...corners]),
    tracks,
    marks,
  };
}
