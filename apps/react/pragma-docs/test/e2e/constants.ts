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
 * A page on the document archetype: the lobby, whose canvas scrolls at a
 * phone's width.
 */
export const DOCUMENT_PATH = "/";
