import { SEARCH_PASSAGE_LENGTH } from "./constants.js";
import type { SearchPassage } from "./types.js";

/**
 * The passage a search result shows: the matched value whole when it fits in
 * `SEARCH_PASSAGE_LENGTH`, else that many UTF-16 code units of it with the
 * first occurrence of the text centred, clamped to the value's ends; and
 * every occurrence of the text lying wholly inside the passage.
 *
 * @param value - The matched field's value.
 * @param needle - The search text, trimmed and lowercased; not empty.
 * @param position - Where the first occurrence starts in the lowercased value.
 * @returns The passage and its ranges, offsets from the passage's start.
 */
export const buildSearchPassage = (
  value: string,
  needle: string,
  position: number,
): SearchPassage => {
  const centred =
    position - Math.floor((SEARCH_PASSAGE_LENGTH - needle.length) / 2);
  const start = Math.max(
    0,
    Math.min(centred, value.length - SEARCH_PASSAGE_LENGTH),
  );
  const passage = value.slice(start, start + SEARCH_PASSAGE_LENGTH);
  const lowered = passage.toLowerCase();
  const ranges: { start: number; length: number }[] = [];
  for (
    let found = lowered.indexOf(needle);
    found !== -1;
    found = lowered.indexOf(needle, found + needle.length)
  ) {
    ranges.push({ start: found, length: needle.length });
  }
  return { passage, ranges };
};
