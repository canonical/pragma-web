import type { ElementType } from "react";

/**
 * Storybook decorator that puts an inspector in the region a workspace gives
 * it: the last three columns of the story's intrinsic grid (`-4 / -1`), a
 * subgrid of them, so what the inspector holds sits on their lines as it
 * does on the site, a key value's key on the first two and its value on the
 * third.
 *
 * @example
 * ```ts
 * decorators: [withInspectorRegion()],
 * parameters: { grid: "intrinsic" },
 * ```
 */
const withInspectorRegion = () => (Story: ElementType) => (
  <div className="subgrid story-inspector">
    <Story />
  </div>
);

export default withInspectorRegion;
