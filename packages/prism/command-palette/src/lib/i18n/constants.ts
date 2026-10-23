/**
 * The palette's English catalog: every string a reader sees, by message key.
 * A value may hold `{name}` placeholders the translator fills, or be a plural
 * record whose branch the `count` value selects: the shape
 * `@canonical/i18n-core`'s `createTranslator` reads. A sentence that wraps
 * an element is still one message: the element's `{name}` placeholder marks
 * where it goes, and `Message` renders the element there, so a translation
 * may reorder the sentence around it.
 */
export const MESSAGES = {
  "palette.label": "Search the graph",
  "palette.failure":
    "The search failed. Close the palette and open it again to retry.",
  "hints.move": "{up} {down} to move",
  "hints.open": "{enter} to open",
  "hints.close": "{escape} to close",
  "search.label": "Search the graph",
  "search.placeholder": "Search by name, address or definition",
  "search.hint": "Type a name, a compact address or a word from a definition.",
  "search.empty": "Nothing in the graph matches “{text}”.",
  "search.results": "Results",
  "search.preview": "Preview",
} as const;
