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
