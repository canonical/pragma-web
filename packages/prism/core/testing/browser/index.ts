/**
 * The browser side of the layout checks: launch Chromium, open a page once
 * per viewport and measure its grid, its scroll model, its overflow and its
 * spacing in each theme. Both apps' layout suites and the archetypes' own
 * suite run on it.
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
  SPACING_STEP_PX,
  THEMES,
  VIEWPORTS,
} from "./constants.js";
export { default as launchBrowser } from "./launchBrowser.js";
export { default as measureLayout } from "./measureLayout.js";
export { default as measurePage } from "./measurePage.js";
export type {
  LayoutMeasure,
  MeasureLayoutOptions,
  MeasurePageOptions,
  Theme,
  ThemedMeasure,
  Viewport,
} from "./types.js";
