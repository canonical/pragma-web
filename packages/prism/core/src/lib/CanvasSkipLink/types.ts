import type { ComponentProps } from "react";

/**
 * Props accepted by `CanvasSkipLink`: the native props of its `<a>` root.
 *
 * The native `href` and `children` are excluded because the link fixes both:
 * it always targets the canvas, and its label is fixed.
 */
export type CanvasSkipLinkProps = Omit<
  ComponentProps<"a">,
  "href" | "children"
>;
