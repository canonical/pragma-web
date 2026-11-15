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
 * Pages on the workspace archetype: the Definitions explorer, and a term's
 * page addressed by the term's absolute IRI, whose current crumb is an
 * identifier with no break opportunity, wider than the strip at a phone's
 * width.
 */
export const WORKSPACE_PATHS = [
  WORKSPACE_PATH,
  `/definitions/${encodeURIComponent("http://pragma.canonical.com/codestandards#CodeStandard")}`,
] as const;

/**
 * The Journeys lens, on the workspace archetype too: its index and a job,
 * both opening on the table, whose rows scroll inside its own region.
 */
export const JOURNEYS_PATHS = [
  "/journeys",
  `/journeys/${encodeURIComponent("sem://design-system-docs#job.l3")}`,
] as const;

/**
 * Pages on the document archetype: the lobby, whose canvas scrolls at a
 * phone's width; the Components catalog and the Standards index, whose
 * columns must fit four grid columns; a standard's entity page, addressed
 * by the standard's IRI, an identifier with no break opportunity; two components' pages, whose identifiers, anatomy trees and
 * properties tables are wider than a phone; the not-found page; and the
 * pages of prose, the sign-in and account pages, the guides and a guide,
 * and the playground, whose sections must span the main column like every
 * other page.
 */
export const DOCUMENT_PATHS = [
  "/",
  "/components",
  "/standards",
  `/standards/${encodeURIComponent("http://pragma.canonical.com/codestandards#code.api.stability")}`,
  `/components/${encodeURIComponent("ds:global.component.accordion")}`,
  `/components/${encodeURIComponent("ds:global.component.button")}`,
  "/not-found",
  "/login",
  "/account?auth=1",
  "/guides",
  "/guides/router-core",
  "/playground",
] as const;

/** The Components catalog as cards, which must fill their rows. */
export const CATALOG_PATH = "/components?as=cards";

/** The catalog's cards, as the layout's fill check reads them. */
export const CATALOG_CARD_SELECTOR =
  ".ds.components-catalog-page .ds.entity-card";

/**
 * The widths the catalog's cards are measured at: a phone's, where the
 * canvas holds three columns; one between one and two groups, where it
 * holds two; and the desktop's.
 */
export const CATALOG_CARD_WIDTHS = [390, 600, 1440] as const;

/**
 * The widths below one group of the shell (448px) the catalog is measured
 * at: the canvas holds three columns there, and every card, with an example
 * or without, spans its whole row.
 */
export const CATALOG_WHOLE_ROW_WIDTHS = [390] as const;

/**
 * The narrowest a catalog card may render, in pixels: wide enough for its
 * title and summary, and for a UI block's rendered example under or beside
 * them.
 */
export const MIN_CATALOG_CARD_WIDTH_PX = 150;

/** The Standards index, whose links and lists must span the main column. */
export const STANDARDS_INDEX_PATH = "/standards";

/** The index's rows, as the layout's fill check reads them. */
export const STANDARDS_INDEX_ROW_SELECTOR = ".ds.standards-index > *";

/**
 * The widths the standards index's facts are measured at, each with the
 * fewest facts that must show there: a phone, where a row is too narrow
 * for most addresses and none need stay; two groups' threshold less one
 * step, where the later facts have left and some rows keep their address;
 * and the desktop, where rows have room for it.
 */
export const STANDARDS_FACT_WIDTHS = [
  { width: 390, fewestShown: 0 },
  { width: 820, fewestShown: 1 },
  { width: 1440, fewestShown: 1 },
] as const;

/** The catalog's rows view, an index that opts its rows into two lines. */
export const CATALOG_ROWS_PATH = "/components";

/** The catalog's rows. */
export const CATALOG_ROW_SELECTOR =
  ".ds.components-catalog-page .ds.entity-row";

/** A row's height in pixels: one 24px line between 4px insets. */
export const ROW_PX = 32;

/** A two-line row's height in pixels: the summary's line under the first. */
export const TWO_LINE_ROW_PX = 56;

/**
 * The facts a standards index row is given in the browser, after its
 * address, so that a row with several facts can be seen narrowing: each
 * fact's property, label and value.
 */
export const ADDED_FACTS = [
  { property: "category", label: "Category", value: "Accessibility" },
  { property: "stage", label: "Stage", value: "Deprecated" },
] as const;

/** The step, in pixels, by which a row is narrowed while its facts leave. */
export const NARROWING_STEP_PX = 4;

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
