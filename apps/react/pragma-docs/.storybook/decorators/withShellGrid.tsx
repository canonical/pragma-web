import type { ElementType } from "react";

/**
 * Storybook decorator that puts a story in the site's shell grid: the one
 * intrinsic grid, named `shell` as the query container the site's
 * container queries read, so a region that changes shape below a number
 * of column groups does so in the story as it does on the site. A story
 * that uses it sets its `grid` parameter to `"none"`, since this element
 * is its grid.
 *
 * @example
 * ```ts
 * decorators: [withShellGrid()],
 * parameters: { grid: "none" },
 * ```
 */
const withShellGrid = () => (Story: ElementType) => (
  <div className="grid intrinsic story-shell">
    <Story />
  </div>
);

export default withShellGrid;
