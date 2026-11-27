import type { ColumnSizing } from "@canonical/dataviews-core/bindings";

/** Declared sizing when a column names none: flexible, with a 96px floor. */
export const DEFAULT_SIZING: ColumnSizing = {
  kind: "flex",
  weight: 1,
  minPx: 96,
};

/** What Tab reaches without a script's help, but no negative tab index. */
export const TABBABLE_SELECTORS: readonly string[] = [
  "a[href]",
  "area[href]",
  "button:not(:disabled)",
  'input:not(:disabled):not([type="hidden"])',
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  "summary",
  "iframe",
  "embed",
  "object",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
  "[tabindex]:not(:disabled)",
].map((selector) => `${selector}:not([tabindex^="-"])`);

/** The attributes the tabbable selectors read, watched for each change. */
export const TABBABLE_ATTRIBUTES: readonly string[] = [
  "href",
  "disabled",
  "tabindex",
  "type",
  "contenteditable",
  "controls",
  "hidden",
  "inert",
  "open",
];
