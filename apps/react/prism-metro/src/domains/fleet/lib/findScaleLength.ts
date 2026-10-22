/**
 * Find the scale that trains drawn together share: the longest of the
 * lengths they must hold, the trains' own and any platform marked beside
 * them, so every one of them fits and all read at one scale.
 *
 * @param lengths - Every length the drawing must hold, in millimetres.
 * @returns The longest of them.
 * @throws When no length is given: an empty drawing has no scale.
 */
export default function findScaleLength(lengths: readonly number[]): number {
  if (lengths.length === 0) {
    throw new Error("a scale needs at least one length to hold");
  }
  return Math.max(...lengths);
}
