import { matchSearchEntry } from "./matchSearchEntry.js";
import type { SearchIndex, SearchMatch } from "./types.js";

/**
 * Order two strings by their UTF-16 code units, which is code-point order
 * for every character outside the supplementary planes. Never by locale, so
 * the order is the same on every machine.
 */
const compareText = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0;

/**
 * Order two matches: by tier, then by position, then by title length, then
 * by title, then by IRI.
 */
const compareMatches = (a: SearchMatch, b: SearchMatch): number =>
  a.tier - b.tier ||
  a.position - b.position ||
  a.title.length - b.title.length ||
  compareText(a.title, b.title) ||
  compareText(a.uri, b.uri);

/**
 * Rank the entries whose title, CURIE or definition contains `text`,
 * ignoring case.
 *
 * A title match ranks before a CURIE match, and a CURIE match before a
 * definition match; within one, an earlier match ranks first, then a
 * shorter title, then the title and then the IRI in code-point order.
 *
 * @param index - The entries to search.
 * @param text - The search text, as the client sent it.
 * @returns The matching entries' IRIs, best first; none when `text` is
 * empty or only whitespace.
 */
export const rankSearchEntries = (
  index: SearchIndex,
  text: string,
): readonly string[] => {
  const needle = text.trim().toLowerCase();
  if (needle === "") return [];
  return index
    .map((entry) => matchSearchEntry(entry, needle))
    .filter((match) => match !== undefined)
    .sort(compareMatches)
    .map((match) => match.uri);
};
