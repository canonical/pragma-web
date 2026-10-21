import type { ReactElement } from "react";
import type { DefinitionsIconProps } from "./types.js";

/** The glyph's width and height when no size is given, in pixels. */
const DEFAULT_SIZE = 16;

/**
 * The Definitions lens's rail glyph: three linked nodes, a 16-unit stroke
 * drawing in `currentColor`, rendered `size` pixels square.
 *
 * It is always `aria-hidden`: the rail entry's visible label names it. The
 * lens passes it as its `icon` in its `routeLensFacet` declaration, so it is
 * what survives the rail's small-viewport collapse.
 *
 * `import { DefinitionsIcon } from "./DefinitionsIcon/index.js";`
 */
export default function DefinitionsIcon({
  size = DEFAULT_SIZE,
  ...props
}: DefinitionsIconProps): ReactElement {
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
      <circle cx="4" cy="4" r="2" />
      <circle cx="12" cy="5" r="2" />
      <circle cx="7" cy="12" r="2" />
      <path d="M5.7 5.2 7 10M6 4.4l4-.2M10.8 6.6 8 10.6" />
    </svg>
  );
}
