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
  "palette.jumpTo": "Jump to",
  "palette.handoff": "Search everything for “{text}”",
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
  "jump.placeholder": "Jump to a lens or a page you read",
  "jump.hint": "Type the name of a lens or of a page you read.",
  "jump.empty": "No lens or page you read matches “{text}”.",
  "jump.results": "Destinations",
  "jump.places": "Places",
  "jump.recent": "Recent pages",
  "result.homeless": "This result has no page on this site.",
} as const;
