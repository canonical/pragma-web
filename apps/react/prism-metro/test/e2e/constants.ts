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
