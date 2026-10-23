import {
  LABEL_BLOCKED_COSINE,
  LABEL_CHARACTER_WIDTH,
  LABEL_DIRECTIONS,
  LABEL_GAP,
  LABEL_SIZE,
} from "./constants.js";
import type {
  Box,
  DrawingPoint,
  LabelPlacement,
  MarkBox,
  TrackSegment,
} from "./types.js";

/** Whether a label direction runs within 22.5° of any of the tracks. */
const isBlocked = (
  direction: DrawingPoint,
  tracks: readonly DrawingPoint[],
): boolean => {
  const length = Math.hypot(direction.x, direction.y);
  return tracks.some(
    (track) =>
      (direction.x * track.x + direction.y * track.y) / length >
      LABEL_BLOCKED_COSINE,
  );
};

/** Whether two boxes overlap. */
const isOverlapping = (a: Box, b: Box): boolean =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

/** Whether a point lies inside a box. */
const isInside = (box: Box, { x, y }: DrawingPoint): boolean =>
  x > box.x && x < box.x + box.width && y > box.y && y < box.y + box.height;

/**
 * Whether two segments cross: each one's ends lie on opposite sides of the
 * other's line.
 */
const isIntersecting = (
  [a, b]: TrackSegment,
  [c, d]: TrackSegment,
): boolean => {
  const side = (p: DrawingPoint, q: DrawingPoint, r: DrawingPoint): number =>
    (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  return side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0;
};

/** Whether a track segment runs through a box. */
const isCrossing = (box: Box, segment: TrackSegment): boolean => {
  const corners = [
    { x: box.x, y: box.y },
    { x: box.x + box.width, y: box.y },
    { x: box.x + box.width, y: box.y + box.height },
    { x: box.x, y: box.y + box.height },
  ];
  return (
    isInside(box, segment[0]) ||
    isInside(box, segment[1]) ||
    corners.some((corner, index) =>
      isIntersecting(segment, [
        corner,
        corners.at((index + 1) % corners.length) as DrawingPoint,
      ]),
    )
  );
};

/**
 * Place a name in one direction from its mark: the anchor sits one gap
 * beyond the mark's edge (and half a line further above or below, so the
 * text clears the mark), and the text runs away from the mark.
 */
const placeInDirection = (
  mark: MarkBox,
  direction: DrawingPoint,
  width: number,
): LabelPlacement => {
  const x =
    mark.x + mark.width / 2 + direction.x * (mark.width / 2 + LABEL_GAP);
  const y =
    mark.y +
    mark.height / 2 +
    direction.y * (mark.height / 2 + LABEL_GAP + LABEL_SIZE / 2);
  const anchor = direction.x > 0 ? "start" : direction.x < 0 ? "end" : "middle";
  const left =
    anchor === "start" ? x : anchor === "end" ? x - width : x - width / 2;
  return {
    x,
    y,
    anchor,
    box: { x: left, y: y - LABEL_SIZE / 2, width, height: LABEL_SIZE },
  };
};

/**
 * Place a station's name beside its mark, deterministically. Directions are
 * tried in the order east, west, north, south and then the diagonals, skipping
 * any a track leaves the station in; the name takes the first where it
 * overlaps nothing already placed and no track runs through it; failing
 * that, the first where it overlaps nothing; failing that, the first
 * direction no track takes; failing that, east. The name's width is estimated
 * from its length, since names are placed before any font has loaded.
 *
 * @param mark - The station's mark.
 * @param tracks - The unit directions the tracks leave the station in.
 * @param taken - The boxes the name must not overlap: every other mark and
 *   every name placed before it.
 * @param segments - The drawn tracks' segments, which the name should not
 *   cover.
 * @returns The label's anchor point, text anchor and estimated box.
 */
export default function placeLabel(
  mark: MarkBox,
  tracks: readonly DrawingPoint[],
  taken: readonly Box[],
  segments: readonly TrackSegment[] = [],
): LabelPlacement {
  const width = mark.stop.title.length * LABEL_SIZE * LABEL_CHARACTER_WIDTH;
  const candidates = LABEL_DIRECTIONS.filter(
    (direction) => !isBlocked(direction, tracks),
  ).map((direction) => placeInDirection(mark, direction, width));
  const isClear = (candidate: LabelPlacement): boolean =>
    !taken.some((box) => isOverlapping(candidate.box, box));
  return (
    candidates.find(
      (candidate) =>
        isClear(candidate) &&
        !segments.some((segment) => isCrossing(candidate.box, segment)),
    ) ??
    candidates.find(isClear) ??
    candidates.at(0) ??
    placeInDirection(mark, LABEL_DIRECTIONS[0], width)
  );
}
