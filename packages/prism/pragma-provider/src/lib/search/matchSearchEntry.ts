import type { SearchEntry, SearchMatch } from "./types.js";

/**
 * Match one entry against normalised search text: the first of its title,
 * CURIE and definition, in that order, whose lowercased value contains the
 * text.
 *
 * @param entry - The entry to match.
 * @param needle - The search text, already trimmed and lowercased, and not
 * empty.
 * @returns The field that matched as `tier` (0 the title, 1 the CURIE, 2
 * the definition) and where in it as `position`, or undefined when none
 * contains the text.
 */
export const matchSearchEntry = (
  entry: SearchEntry,
  needle: string,
): SearchMatch | undefined => {
  const match = [entry.title, entry.curie, entry.definition ?? ""]
    .map((field, tier) => ({
      tier,
      position: field.toLowerCase().indexOf(needle),
    }))
    .find((candidate) => candidate.position !== -1);
  return match === undefined
    ? undefined
    : {
        uri: entry.uri,
        tier: match.tier,
        position: match.position,
        title: entry.title,
      };
};
