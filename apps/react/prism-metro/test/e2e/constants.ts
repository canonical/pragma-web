/**
 * How long the metro graph may take to answer its first request.
 */
export const GRAPH_READY_MS = 20_000;

/**
 * How long a `dev*` server may take to answer its first request: it boots
 * straight away.
 */
export const DEV_READY_MS = 30_000;

/**
 * How long a `preview*` server may take to answer its first request: it
 * builds the client and the renderer before it serves.
 */
export const PREVIEW_READY_MS = 120_000;

/**
 * How long a click may take to put its destination on screen: the router's
 * load, the graph's answer and the render.
 */
export const CLICK_SETTLE_MS = 15_000;

/** How long a page may take to settle once it is requested. */
export const PAGE_SETTLE_MS = 30_000;

/** A page on the workspace archetype: the Definitions explorer. */
export const WORKSPACE_PATH = "/definitions";
