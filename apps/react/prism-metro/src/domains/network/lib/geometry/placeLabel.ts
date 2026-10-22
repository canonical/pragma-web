import {
  LABEL_BLOCKED_COSINE,
  LABEL_DIRECTIONS,
  LABEL_GAP,
} from "./constants.js";
import type { DrawingPoint, LabelPlacement } from "./types.js";

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

/**
 * Place a station's name beside its mark, in the first direction no track
 * leaves the station in: east, west, north, south, then the diagonals. When
 * every direction is taken the name goes east. The text runs away from the
 * mark: from its start when it sits east, to its end when west, and from its
 * middle when straight above or below.
 *
 * @param centre - The mark's centre.
 * @param halfWidth - Half the mark's width.
 * @param halfHeight - Half the mark's height.
 * @param tracks - The unit directions the tracks leave the station in.
 * @returns The label's anchor point and text anchor.
 */
export default function placeLabel(
  centre: DrawingPoint,
  halfWidth: number,
  halfHeight: number,
  tracks: readonly DrawingPoint[],
): LabelPlacement {
  const direction =
    LABEL_DIRECTIONS.find((candidate) => !isBlocked(candidate, tracks)) ??
    LABEL_DIRECTIONS[0];
  return {
    x: centre.x + direction.x * (halfWidth + LABEL_GAP),
    y: centre.y + direction.y * (halfHeight + LABEL_GAP),
    anchor: direction.x > 0 ? "start" : direction.x < 0 ? "end" : "middle",
  };
}
