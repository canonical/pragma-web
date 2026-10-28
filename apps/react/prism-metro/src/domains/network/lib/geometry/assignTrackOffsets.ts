import collectSegments from "./collectSegments.js";
import { TRACK_SPACING } from "./constants.js";
import type { DiagramLine } from "./types.js";

/** Order two line codes as people read them: `2` before `10`, `R1` after `5`. */
const compareCodes = (a: DiagramLine, b: DiagramLine): number =>
  a.code.localeCompare(b.code, "en", { numeric: true });

/**
 * Assign each line its offset on every segment it runs over, so the lines
 * sharing a stretch are drawn side by side rather than on top of one
 * another.
 *
 * The lines on a segment are ordered by their codes, which keeps the order
 * stable from one stretch to the next, and centred on the segment: one line
 * runs on it, two at half a spacing either side, three at minus one, zero
 * and one spacing. An offset is measured along the normal of the segment's
 * canonical direction, so a line keeps its side whichever way its route runs.
 *
 * @param lines - The lines, each with only the routes the map draws.
 * @returns The offset of each line, by segment key and then by line IRI.
 */
export default function assignTrackOffsets(
  lines: readonly DiagramLine[],
): ReadonlyMap<string, ReadonlyMap<string, number>> {
  const linesBySegment = new Map<string, DiagramLine[]>();
  for (const line of [...lines].sort(compareCodes)) {
    for (const route of line.routes) {
      for (const { key } of collectSegments(route)) {
        const onSegment = linesBySegment.get(key) ?? [];
        if (!onSegment.includes(line)) onSegment.push(line);
        linesBySegment.set(key, onSegment);
      }
    }
  }
  const offsets = new Map<string, ReadonlyMap<string, number>>();
  for (const [key, onSegment] of linesBySegment) {
    const centre = (onSegment.length - 1) / 2;
    offsets.set(
      key,
      new Map(
        onSegment.map((line, index) => [
          line.uri,
          (index - centre) * TRACK_SPACING,
        ]),
      ),
    );
  }
  return offsets;
}
