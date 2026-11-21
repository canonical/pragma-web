import { SEARCH_FIELDS } from "./constants.js";
import type { SearchEntry, SearchMatch } from "./types.js";

/**
 * Match one entry against normalised search text: the first of its
 * `SEARCH_FIELDS`, in that order, whose lowercased value contains the text.
 * A missing definition matches nothing.
 *
 * @param entry - The entry to match.
 * @param needle - The search text, already trimmed and lowercased, and not
 * empty.
 * @returns The place in `SEARCH_FIELDS` of the field that matched as
 * `tier`, where in it as `position` and its value as `value`, or undefined
 * when none contains the text.
 */
export const matchSearchEntry = (
  entry: SearchEntry,
  needle: string,
): SearchMatch | undefined => {
  const match = SEARCH_FIELDS.map((field, tier) => {
    const value = entry[field] ?? "";
    return { tier, value, position: value.toLowerCase().indexOf(needle) };
  }).find((candidate) => candidate.position !== -1);
  return match === undefined
    ? undefined
    : {
        uri: entry.uri,
        tier: match.tier,
        position: match.position,
        value: match.value,
        title: entry.title,
        type: entry.type,
      };
};
