import type { DiagramRoute, DiagramStop, Segment } from "./types.js";

/**
 * Name the segment a route runs from `start` to `end` so both directions
 * share it: the stop whose IRI sorts first is its canonical start.
 */
const toSegment = (start: DiagramStop, end: DiagramStop): Segment => {
  const [from, to] = start.uri < end.uri ? [start, end] : [end, start];
  return { start, end, from, to, key: `${from.uri} ${to.uri}` };
};

/**
 * Collect the segments a route runs over, in calling order: one between each
 * pair of consecutive stops and, on a loop, the closing segment from the
 * last stop back to the first.
 *
 * @param route - The route.
 * @returns Its segments, each in its canonical direction.
 */
export default function collectSegments(
  route: DiagramRoute,
): readonly Segment[] {
  const { stops, isLoop } = route;
  const segments = stops
    .slice(1)
    .map((stop, index) => toSegment(stops.at(index) as DiagramStop, stop));
  // More than two stops: a loop over two would close onto its one segment.
  if (isLoop && stops.length > 2) {
    segments.push(
      toSegment(stops.at(-1) as DiagramStop, stops.at(0) as DiagramStop),
    );
  }
  return segments;
}
