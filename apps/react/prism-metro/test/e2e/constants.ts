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
 * A field name as long as an ontology property's local name runs, one word
 * wider than a key's two columns: set in place of a station page's first
 * key to measure how a long key lays out.
 */
export const LONG_FIELD_NAME =
  "hasAccessibleStepFreeInterchangeWithBusTerminal";

/** The indexes that lay their entities out as cards. */
export const CARDS_PATHS = [
  "/stations?view=cards",
  "/lines?view=cards",
] as const;

/** Every card of an index's cards view. */
export const INDEX_CARD_SELECTOR = ".ds.entity-list .ds.entity-card";

/** How far a measured edge may round from the edge it meets, in pixels. */
export const WIDTH_TOLERANCE_PX = 0.5;
