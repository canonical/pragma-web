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

/**
 * A term's page on the workspace archetype, addressed by the term's
 * absolute IRI: the trail's current crumb is an identifier with no break
 * opportunity, wider than the strip at a phone's width.
 */
export const TERM_IRI_PATH = `/definitions/${encodeURIComponent("http://www.w3.org/2000/01/rdf-schema#Class")}`;

/**
 * A station's page addressed by its absolute IRI, whose current crumb is
 * wider than the strip at a phone's width.
 */
export const STATION_IRI_PATH = `/stations/${encodeURIComponent("https://metro.example/onto#northgate")}`;

/**
 * How far past another edge, in pixels, an edge may round: sub-pixel
 * layout rounds each box on its own.
 */
export const WIDTH_TOLERANCE_PX = 0.5;
