/**
 * The URL schemes a link may never be told to keep, because each one makes a
 * link run code or read something other than a page: a script (`javascript`,
 * `vbscript`), inline content (`data`) or the reader's own files (`file`).
 */
export const REFUSED_LINK_SCHEMES = [
  "javascript",
  "vbscript",
  "data",
  "file",
] as const;

/**
 * A URL scheme as a consumer names one: a lower-case letter, then lower-case
 * letters, digits, `+`, `.` or `-`. Lower case only, because the sanitiser
 * compares schemes case-sensitively, so a scheme named in upper case would
 * keep its links on one side of the pipeline and lose them on the other.
 */
export const LINK_SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*$/;

/**
 * The scheme a URL opens with, captured: the run of scheme characters before
 * the first colon. A URL with a `/`, `?` or `#` before its first colon does
 * not match, so a relative URL never reads as having a scheme.
 */
export const URL_SCHEME_PATTERN = /^([a-z][a-z0-9+.-]*):/;
