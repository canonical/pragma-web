/**
 * How long the dev cell may take to answer its first request: it boots the
 * graph server first, and compiling the schema dominates the boot.
 */
export const DEV_READY_MS = 90_000;

/** How long a page may take to settle once it is requested. */
export const PAGE_SETTLE_MS = 30_000;

/** A page on the workspace archetype: the Definitions explorer. */
export const WORKSPACE_PATH = "/definitions";

/**
 * Pages on the document archetype: the lobby, whose canvas scrolls at a
 * phone's width; the Components catalog and the Standards index, whose
 * columns must fit four grid columns; and a standard's entity page, whose
 * current crumb is the standard's IRI, an identifier with no break
 * opportunity.
 */
export const DOCUMENT_PATHS = [
  "/",
  "/components",
  "/standards",
  `/standards/${encodeURIComponent("http://pragma.canonical.com/codestandards#code.api.stability")}`,
] as const;
