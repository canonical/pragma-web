import type { ElementType } from "react";

/**
 * Storybook decorator that puts a story in a shell grid like the one a lens
 * renders: the one intrinsic grid, named `shell` as the query container the
 * components' container queries read, so a component that changes shape
 * below a number of column groups does so in the story as it does in a
 * lens. A story that uses it sets its `grid` parameter to `"none"`, since
 * this element is its grid.
 *
 * @example
 * ```ts
 * decorators: [withCards(), withShellGrid()],
 * parameters: { grid: "none" },
 * ```
 */
const withShellGrid = () => (Story: ElementType) => (
  <div className="grid intrinsic story-shell">
    <Story />
  </div>
);

export default withShellGrid;
