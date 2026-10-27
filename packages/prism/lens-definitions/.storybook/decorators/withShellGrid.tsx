import type { ElementType } from "react";

/**
 * Storybook decorator that stands in for a site's shell: the one
 * `.grid.intrinsic` root, the query container named `shell`, one row at the
 * viewport's height. The archetype layouts are subgrids of it, so they lay
 * out only inside it.
 *
 * @example
 * ```ts
 * decorators: [withShellGrid()]
 * ```
 */
const withShellGrid = () => (Story: ElementType) => (
  <div
    className="grid intrinsic"
    style={{
      container: "shell / inline-size",
      gridTemplateRows: "minmax(0, 1fr)",
      blockSize: "100dvh",
      overflow: "clip",
    }}
  >
    <Story />
  </div>
);

export default withShellGrid;
