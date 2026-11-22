/**
 * The pattern that finds a search text in a value: every occurrence, matched
 * on the value as written, with Unicode case folding, and the text's
 * regular-expression syntax characters taken literally.
 *
 * @param needle - The search text, trimmed; not empty.
 * @returns A global, case-insensitive, Unicode pattern for the text.
 */
export const buildSearchPattern = (needle: string): RegExp =>
  new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "giu");
