/**
 * How long the dev cell may take to answer its first request: it boots the
 * graph server first, and compiling the schema dominates the boot.
 */
export const DEV_READY_MS = 90_000;

/**
 * How long a preview cell may take to answer its first request: it builds
 * the client and compiles the renderer before it serves.
 */
export const PREVIEW_READY_MS = 90_000;

/** How long a page may take to settle once it is requested. */
export const PAGE_SETTLE_MS = 30_000;

/** A page on the workspace archetype: the Definitions explorer. */
export const WORKSPACE_PATH = "/definitions";

/**
 * Pages on the document archetype: the lobby, whose canvas scrolls at a
 * phone's width; the Components catalog and the Standards index, whose
 * columns must fit four grid columns; a standard's entity page, whose
 * current crumb is the standard's IRI, an identifier with no break
 * opportunity; a component's entity page, whose identifiers and
 * properties table are wider than a phone; the not-found page; and the
 * pages of plain flow, the sign-in and account pages, a lens's
 * placeholder and the playground, whose sections must span the main
 * column like every other page.
 */
export const DOCUMENT_PATHS = [
  "/",
  "/components",
  "/standards",
  `/standards/${encodeURIComponent("http://pragma.canonical.com/codestandards#code.api.stability")}`,
  `/components/${encodeURIComponent("ds:global.component.accordion")}`,
  "/not-found",
  "/login",
  "/account?auth=1",
  "/guides",
  "/playground",
] as const;

/** The Components catalog, whose cards must fill their rows. */
export const CATALOG_PATH = "/components";

/** The catalog's cards, as the layout's fill check reads them. */
export const CATALOG_CARD_SELECTOR = ".catalog-cards > li";

/** The Standards index, whose links and lists must span the main column. */
export const STANDARDS_INDEX_PATH = "/standards";

/** The index's rows, as the layout's fill check reads them. */
export const STANDARDS_INDEX_ROW_SELECTOR = ".ds.standards-index > *";

/**
 * How far apart, in pixels, two edges or widths of boxes that fill the
 * same tracks may round: sub-pixel layout rounds each box on its own.
 */
export const WIDTH_TOLERANCE_PX = 0.5;

/** The Definitions explorer, with no term and on a class's page. */
export const DEFINITIONS_PATHS = [
  "/definitions",
  `/definitions/${encodeURIComponent("ds:UIBlock")}`,
] as const;

/**
 * Desktops shorter than the 1440 by 900 the layout is designed for, once
 * the browser's chrome is taken: a laptop's 1440 by 780 and a 1280 by 720,
 * where the inspector moves into its drawer.
 */
export const SHORT_DESKTOP_VIEWPORTS = [
  { name: "1440x780", width: 1440, height: 780 },
  { name: "1280x720", width: 1280, height: 720 },
] as const;

/** How long a camera move a control asks for takes to settle, in ms. */
export const CAMERA_SETTLE_MS = 600;

/**
 * The smallest size any text may render at on screen, in pixels: the
 * graph heuristics' legibility floor.
 */
export const MIN_SCREEN_TEXT_PX = 12;

/**
 * How far a graph node's text sits inside each side of its box, in SVG
 * user units: the node's 1px border and its 8px inset.
 */
export const GRAPH_NODE_TEXT_INSET = 9;
