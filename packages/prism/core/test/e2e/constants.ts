/**
 * The widths the archetypes are laid out at, with what each must show: at
 * 1440px (twelve columns, three groups) the inspector is a region and the
 * aside sits beside the page; at 1000px (eight columns, below three groups
 * but not two) the inspector moves to its drawer and the aside stays beside
 * the page; at 390px (four columns, below one group) the rail narrows to
 * one column and the aside drops under the page.
 */
export const ARCHETYPE_VIEWPORTS = [
  {
    width: 1440,
    height: 900,
    columns: 12,
    inspectorShown: true,
    canvasColumns: ["3", "-4"],
    asideBeside: true,
  },
  {
    width: 1000,
    height: 800,
    columns: 8,
    inspectorShown: false,
    canvasColumns: ["3", "-1"],
    asideBeside: true,
  },
  {
    width: 390,
    height: 844,
    columns: 4,
    inspectorShown: false,
    canvasColumns: ["2", "-1"],
    asideBeside: false,
  },
] as const;

/** The core stylesheets the archetypes lay out with, by component folder. */
export const COMPONENT_STYLESHEETS = [
  "Canvas",
  "DocumentLayout",
  "LensBreadcrumbs",
  "ModeStrip",
  "WorkspaceLayout",
] as const;

/**
 * The published skip link's stylesheet, within `@canonical/react-ds-global`:
 * it takes the link every layout renders first out of the flow, as a site
 * that loads the package's styles has it.
 */
export const SKIP_LINK_STYLESHEET =
  "dist/esm/lib/_work_in_progress/SkipLink/styles.css";

/**
 * The published Breadcrumbs' stylesheets, within
 * `@canonical/react-ds-global`: the list and its items, which a site loads
 * before `LensBreadcrumbs`' own, as the component's imports order them.
 */
export const BREADCRUMBS_STYLESHEETS = [
  "dist/esm/lib/component/Breadcrumbs/styles.css",
  "dist/esm/lib/component/Breadcrumbs/common/Item/styles.css",
] as const;

/**
 * An absolute IRI, the address of an entity page with no prefix: an
 * identifier with no break opportunity, which the trail never draws.
 */
export const ABSOLUTE_IRI =
  "http://pragma.canonical.com/codestandards#code.api.stability";

/**
 * A lens's name with no break opportunity, wider than the trail at every
 * width: the one crumb of a trail that ends at the parent, which must end
 * in an ellipsis rather than wrap or reach past the strip.
 */
export const LONG_LENS_LABEL =
  "Codestandardsandconventionsforeverypackageofthedesignsystem";

/**
 * The site-level rules a shell carries: the intrinsic grid's narrow column
 * floor and the shell's own grid, the one query container.
 */
export const SHELL_RULES = `
:root { --grid-col-min: min(100px, calc((100% - 3 * var(--grid-gutter)) / 4)); }
.ds.shell { container: shell / inline-size; grid-template-rows: minmax(0, 1fr); gap: var(--grid-gutter); block-size: 100dvh; overflow: clip; }
body { margin: 0; }
`;

/** How far the canvas is scrolled to see that the aside moves with it. */
export const SCROLL_PX = 400;

/**
 * The class of the band a document's page draws at its top, such as a
 * region's rule, which bleeds across the gutter to the rail's border.
 */
export const PAGE_BAND_CLASS_NAME = "page-band";

/**
 * The core stylesheets a sectioned view lays out with inside a document,
 * by component folder: the layout's, then the view's and its parts'.
 */
export const SECTIONED_VIEW_STYLESHEETS = [
  ...COMPONENT_STYLESHEETS,
  "SectionedView",
  "SectionedView/common/ContentsBar",
  "SectionedView/common/ContentsList",
] as const;

/**
 * The widths below three groups (1376px) at which a sectioned view opens on
 * its "On this page" bar: a laptop just below them and a phone.
 */
export const CONTENTS_BAR_VIEWPORTS = [
  { width: 1366, height: 768 },
  { width: 390, height: 844 },
] as const;

/**
 * The `@canonical/styles` modifiers a sectioned view reads: the density
 * channel, whose line unit sets the bar's height and so each heading's
 * scroll margin.
 */
export const SECTIONED_VIEW_MODIFIERS = ["modifiers.density.css"] as const;

/**
 * The styles context and density a docs site paints on its document
 * element, which choose the density channel's values.
 */
export const DOCUMENT_CONTEXT_CLASS_NAME = "docs comfortable";

/** The sections of the view the bar is read on, more than the bar needs. */
export const SECTION_TITLES = [
  "Variants",
  "Usage",
  "Guidelines",
  "Anatomy",
  "Properties",
] as const;

/** Paragraphs in each section, enough to scroll any heading to the bar. */
export const SECTION_PARAGRAPHS = 12;

/**
 * How many sections the long index is read with: more entries than a
 * phone's screen holds at comfortable density, about 44px each.
 */
export const LONG_INDEX_SECTIONS = 30;

/**
 * The header row of the wide table a section's prose holds: more columns
 * than a phone's screen holds, none of whose cells wraps.
 */
export const WIDE_TABLE_COLUMNS = [
  "Property",
  "Type",
  "Default",
  "Required",
  "Description",
  "Since",
  "Deprecated",
] as const;

/** The phone the long index and the prose's wide table are read on. */
export const PHONE_VIEWPORT = { width: 390, height: 844 } as const;

/** The address the server-rendered page is served at, never fetched. */
export const PAGE_URL = "http://prism.test/";

/** How far a heading may rest from the bar's lower edge, in pixels. */
export const BAR_EDGE_TOLERANCE_PX = 1;
