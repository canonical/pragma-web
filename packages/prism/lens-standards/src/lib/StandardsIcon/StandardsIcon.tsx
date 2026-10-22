import type { ReactElement } from "react";
import type { StandardsIconProps } from "./types.js";

/** The glyph's width and height when no size is given, in pixels. */
const DEFAULT_SIZE = 16;

/**
 * The Standards lens's rail glyph: a shield with a check mark, a 16-unit
 * stroke drawing in `currentColor`, rendered `size` pixels square.
 *
 * It is always `aria-hidden`: the rail entry's visible label names it. The
 * lens passes it as its `icon` in its `routeLensFacet` declaration, so it is
 * what survives the rail's small-viewport collapse.
 *
 * `import { StandardsIcon } from "./StandardsIcon/index.js";`
 */
export default function StandardsIcon({
  size = DEFAULT_SIZE,
  ...props
}: StandardsIconProps): ReactElement {
  return (
    <svg
      {...props}
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 16 16"
      width={size}
    >
      <path d="M8 2 13 4v4c0 3.2-2.2 5.3-5 6-2.8-.7-5-2.8-5-6V4l5-2z" />
      <path d="M5.8 8l1.6 1.6L10.5 6.5" />
    </svg>
  );
}
