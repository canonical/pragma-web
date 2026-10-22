/**
 * The environment variable naming the Chromium binary the browser suites
 * launch. Left unset, Playwright launches the browser it installed itself.
 */
export const CHROMIUM_EXECUTABLE_PATH_ENV_VAR = "E2E_CHROMIUM_EXECUTABLE_PATH";

/**
 * How long the dev cell may take to answer its first request: it boots the
 * graph server first, and compiling the schema dominates the boot.
 */
export const DEV_READY_MS = 90_000;

/** How long a page may take to settle once it is requested. */
export const PAGE_SETTLE_MS = 30_000;

/** The viewports the layout is measured at: a desktop and a phone. */
export const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900, columns: 12 },
  { name: "390", width: 390, height: 844, columns: 4 },
] as const;

/** The themes the layout is measured in, by the class on `<html>`. */
export const THEMES = ["light", "dark"] as const;

/** A page on the workspace archetype: the Definitions explorer. */
export const WORKSPACE_PATH = "/definitions";

/** A page on the document archetype: the Components catalog. */
export const DOCUMENT_PATH = "/components";

/** The grid every spacing in the chrome sits on, in pixels. */
export const SPACING_STEP_PX = 4;

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
