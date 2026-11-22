import type { PassagePiece, PassageRange } from "./types.js";

/**
 * Split a passage into its plain and matched pieces. Ranges are read in
 * start order; a range that overlaps the one before it, or runs past the
 * passage, is clipped to what is left, and an empty piece is dropped.
 *
 * @param passage - The passage, as the provider cut it.
 * @param ranges - The runs that hold the text, in UTF-16 units.
 * @returns The pieces, in passage order, whose texts join to the passage.
 */
export default function splitPassage(
  passage: string,
  ranges: readonly PassageRange[],
): readonly PassagePiece[] {
  const pieces: PassagePiece[] = [];
  let cursor = 0;
  for (const { start, length } of [...ranges].sort(
    (a, b) => a.start - b.start,
  )) {
    const from = Math.max(start, cursor);
    const to = Math.min(start + length, passage.length);
    if (to <= from) continue;
    if (from > cursor) {
      pieces.push({
        start: cursor,
        text: passage.slice(cursor, from),
        matched: false,
      });
    }
    pieces.push({ start: from, text: passage.slice(from, to), matched: true });
    cursor = to;
  }
  if (cursor < passage.length) {
    pieces.push({
      start: cursor,
      text: passage.slice(cursor),
      matched: false,
    });
  }
  return pieces;
}
