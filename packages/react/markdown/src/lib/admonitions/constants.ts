/**
 * The admonition kinds GitHub-flavoured Markdown recognises, in the order
 * GitHub documents them. A blockquote opening with `[!KIND]` on a line of its
 * own is one of these call-outs; any other marker is an ordinary quote.
 */
export const ADMONITION_KINDS = [
  "note",
  "tip",
  "important",
  "warning",
  "caution",
] as const;

/**
 * Matches an admonition marker at the very start of a blockquote's first
 * paragraph: `[!KIND]`, case-insensitive, followed only by spaces or tabs up to
 * the end of its line. Capture group 1 is the kind. Text on the marker's own
 * line (`[!NOTE] text`) does not match, as on GitHub.
 */
export const ADMONITION_MARKER =
  /^\[!(note|tip|important|warning|caution)\][^\S\n]*(?:\n|$)/i;
