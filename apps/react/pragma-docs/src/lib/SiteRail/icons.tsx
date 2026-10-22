/**
 * The site rail's utility glyphs — the same 16px stroke drawing as the lens
 * glyphs (`#lib/LensIcons`), at the utility cluster's 15px. Always
 * `aria-hidden`: the link's visible label names it.
 */

import type { ReactElement } from "react";
import { buildGlyphProps, type IconProps } from "#lib/LensIcons";

/** Playground: a pair of angle brackets, the demo canvas's glyph. */
export const PlaygroundIcon = ({ size = 15 }: IconProps): ReactElement => (
  <svg aria-hidden="true" {...buildGlyphProps(size)}>
    <path d="M5 5 2 8l3 3M11 5l3 3-3 3" />
  </svg>
);

/** Demo sign-in: a person's head and shoulders. */
export const SignInIcon = ({ size = 15 }: IconProps): ReactElement => (
  <svg aria-hidden="true" {...buildGlyphProps(size)}>
    <circle cx="8" cy="5.5" r="2.5" />
    <path d="M3.5 13.5c.6-2.6 2.3-4 4.5-4s3.9 1.4 4.5 4" />
  </svg>
);
