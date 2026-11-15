/**
 * The browser side of the layout checks: launch Chromium, open a page once
 * per viewport and measure its grid, its scroll model, its overflow and its
 * spacing in each theme; read the rows' heights, and a chip's open peek
 * against its chip. Both apps' layout and peek suites and the archetypes'
 * own suite run on it.
 *
 * @experimental Test infrastructure for prism's own packages and apps; its
 * measure may grow with the layout rules.
 *
 * @module
 */

export {
  BAND_SELECTOR,
  CHROME_SELECTOR,
  CHROMIUM_EXECUTABLE_PATH_ENV_VAR,
  FRAME_SELECTOR,
  PEEK_EDGE_INSET_PX,
  PEEK_OFFSET_PX,
  PEEK_TOLERANCE_PX,
  PEEK_WIDTH_PX,
  ROW_PX,
  SPACING_STEP_PX,
  STRIP_VIEWPORTS,
  THEMES,
  TWO_LINE_ROW_PX,
  VIEWPORTS,
} from "./constants.js";
export { default as launchBrowser } from "./launchBrowser.js";
export { default as listPeekViolations } from "./listPeekViolations.js";
export { default as measureLayout } from "./measureLayout.js";
export { default as measurePage } from "./measurePage.js";
export { default as measurePeek } from "./measurePeek.js";
export { default as measureRowHeights } from "./measureRowHeights.js";
export { default as measureStrip } from "./measureStrip.js";
export { default as placePeek } from "./placePeek.js";
export type {
  LayoutMeasure,
  MeasureLayoutOptions,
  MeasurePageOptions,
  PeekBox,
  PeekMeasure,
  PeekPlace,
  PeekTimes,
  RowHeight,
  StripGroupBox,
  StripMeasure,
  StripViewport,
  Theme,
  ThemedMeasure,
  Viewport,
} from "./types.js";
export { default as watchPeek } from "./watchPeek.js";
