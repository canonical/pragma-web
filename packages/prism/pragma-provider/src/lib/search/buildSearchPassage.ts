import { buildSearchPattern } from "@canonical/prism-contract";
import { SEARCH_PASSAGE_LENGTH } from "./constants.js";
import type { SearchPassage } from "./types.js";

/** Whether a UTF-16 code unit is the first half of a surrogate pair. */
const isHighSurrogate = (unit: number): boolean =>
  unit >= 0xd800 && unit <= 0xdbff;

/** Whether a UTF-16 code unit is the second half of a surrogate pair. */
const isLowSurrogate = (unit: number): boolean =>
  unit >= 0xdc00 && unit <= 0xdfff;

/**
 * The passage a search result shows: the matched value whole when it fits in
 * `SEARCH_PASSAGE_LENGTH`, else that many UTF-16 code units of it with the
 * first occurrence of the text centred, clamped to the value's ends, each
 * edge moved inward off a split surrogate pair; and every occurrence of the
 * text lying wholly inside the passage. Occurrences are found on the value as
 * written, so their offsets hold whatever lowercasing would do to its length.
 * A value without an occurrence gives its head and no ranges.
 *
 * @param value - The matched field's value.
 * @param needle - The search text, trimmed; not empty.
 * @returns The passage and its ranges, offsets from the passage's start.
 */
export const buildSearchPassage = (
  value: string,
  needle: string,
): SearchPassage => {
  const occurrences = [...value.matchAll(buildSearchPattern(needle))].map(
    ({ index, 0: text }) => ({ start: index, length: text.length }),
  );
  const first = occurrences.at(0);
  const lead = Math.floor(
    (SEARCH_PASSAGE_LENGTH -
      Math.min(first?.length ?? 0, SEARCH_PASSAGE_LENGTH)) /
      2,
  );
  let start = Math.max(
    0,
    Math.min((first?.start ?? 0) - lead, value.length - SEARCH_PASSAGE_LENGTH),
  );
  let end = Math.min(start + SEARCH_PASSAGE_LENGTH, value.length);
  if (isLowSurrogate(value.charCodeAt(start))) start += 1;
  if (isHighSurrogate(value.charCodeAt(end - 1))) end -= 1;
  // The window opens at or before the first occurrence, so an occurrence can
  // only be cut by its end.
  const ranges = occurrences
    .filter((occurrence) => occurrence.start + occurrence.length <= end)
    .map((occurrence) => ({
      start: occurrence.start - start,
      length: occurrence.length,
    }));
  return { passage: value.slice(start, end), ranges };
};
