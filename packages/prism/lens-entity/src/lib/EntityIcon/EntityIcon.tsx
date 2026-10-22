import type { ReactElement } from "react";
import type { EntityIconProps } from "./types.js";

/** The glyph's width and height when no size is given, in pixels. */
const DEFAULT_SIZE = 16;

/**
 * The entity lens's default rail glyph: three entries of a list, each a
 * bullet and a line, a 16-unit stroke drawing in `currentColor`, rendered
 * `size` pixels square.
 *
 * It is always `aria-hidden`: the rail entry's visible label names it.
 * `createEntityRoutes` declares it as the lens's `icon` unless the site
 * gives its own.
 *
 * `import { EntityIcon } from "./EntityIcon/index.js";`
 */
export default function EntityIcon({
  size = DEFAULT_SIZE,
  ...props
}: EntityIconProps): ReactElement {
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
      <circle cx="3" cy="4" r="1" />
      <circle cx="3" cy="8" r="1" />
      <circle cx="3" cy="12" r="1" />
      <path d="M6 4h7M6 8h7M6 12h7" />
    </svg>
  );
}
