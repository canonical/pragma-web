/**
 * The vocabulary the browser measurements share: where the browser comes
 * from, the widths and themes a layout is measured at, and the chrome whose
 * spacing is measured.
 */

/**
 * The environment variable naming the Chromium binary the browser suites
 * launch. Left unset, Playwright launches the browser it installed itself.
 */
export const CHROMIUM_EXECUTABLE_PATH_ENV_VAR = "E2E_CHROMIUM_EXECUTABLE_PATH";

/**
 * The viewports a site's layout is measured at, a desktop and a phone, with
 * the columns the shell's intrinsic grid lays at each.
 */
export const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900, columns: 12 },
  { name: "390", width: 390, height: 844, columns: 4 },
] as const;

/** The themes a layout is measured in, by the class on `<html>`. */
export const THEMES = ["light", "dark"] as const;

/** The grid every spacing in the chrome sits on, in pixels. */
export const SPACING_STEP_PX = 4;

/**
 * How far past the viewport an edge may round before it counts as an
 * overflow, in pixels: sub-pixel layout rounds a box that fits exactly.
 */
export const OVERFLOW_TOLERANCE_PX = 0.5;

/** The overflow values that make an element clip or scroll what it holds. */
export const CLIPPING_OVERFLOWS: readonly string[] = [
  "auto",
  "scroll",
  "hidden",
  "clip",
];

/**
 * The layout's regions: the archetypes' direct children and the canvas.
 * Each must hold its content within its own width, so a region is never
 * where an overflow is excused.
 */
export const REGION_SELECTOR = [
  ".ds.workspace-layout > *",
  ".ds.document-layout > *",
  "main.ds.canvas",
].join(", ");

/**
 * The layout's frame: the archetypes' strips, in which nothing may scroll
 * sideways.
 */
export const FRAME_SELECTOR = [
  ".ds.workspace-layout > .strip",
  ".ds.document-layout > .strip",
].join(", ");

/**
 * The chrome the spacing histogram measures: the shell, the archetypes and
 * their regions, and the core components every layout places. A select's
 * options are left out: the browser lays them out in its own popup.
 */
export const CHROME_SELECTOR = [
  ".ds.shell",
  ".ds.workspace-layout",
  ".ds.workspace-layout > *",
  ".ds.document-layout",
  ".ds.document-layout > *",
  ".ds.canvas > .page",
  ".ds.rail",
  ".ds.rail *:not(option)",
  ".ds.mode-strip",
  ".ds.mode-strip > *",
].join(", ");
