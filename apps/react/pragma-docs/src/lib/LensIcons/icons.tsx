/**
 * The site's lens glyphs — 16px stroke glyphs, one per lens the site
 * declares (a lens package carries its own), that each lens passes as its
 * `icon` in `routeLensFacet.of`. Inline SVG (no asset
 * pipeline), `currentColor`, and always `aria-hidden`: the accessible name
 * is the rail entry's visible label. The icons are what survives the rail's
 * small-viewport collapse, so every lens must carry one.
 */

import type { ReactElement } from "react";
import { buildGlyphProps } from "./buildGlyphProps.js";
import type { IconProps } from "./types.js";

/**
 * Home: a house, the Home lens's rail glyph.
 *
 * A stroke glyph `size` pixels square (16 by default), drawn in
 * `currentColor` and `aria-hidden`: the rail entry's visible label names
 * it. A lens passes it as its `icon` in `routeLensFacet.of`.
 */
export const HomeIcon = ({ size = 16 }: IconProps): ReactElement => (
  <svg aria-hidden="true" {...buildGlyphProps(size)}>
    <path d="M2 8.5 8 3l6 5.5M4 7.5V13h8V7.5" />
  </svg>
);

/**
 * Components: a grid of four tiles, the Components lens's rail glyph.
 *
 * A stroke glyph `size` pixels square (16 by default), drawn in
 * `currentColor` and `aria-hidden`: the rail entry's visible label names
 * it. A lens passes it as its `icon` in `routeLensFacet.of`.
 */
export const ComponentsIcon = ({ size = 16 }: IconProps): ReactElement => (
  <svg aria-hidden="true" {...buildGlyphProps(size)}>
    <rect height="4.6" rx="1" width="4.6" x="2.5" y="2.5" />
    <rect height="4.6" rx="1" width="4.6" x="9" y="2.5" />
    <rect height="4.6" rx="1" width="4.6" x="2.5" y="9" />
    <rect height="4.6" rx="2.3" width="4.6" x="9" y="9" />
  </svg>
);

/**
 * Standards: a shield with a check, the Standards lens's rail glyph.
 *
 * A stroke glyph `size` pixels square (16 by default), drawn in
 * `currentColor` and `aria-hidden`: the rail entry's visible label names
 * it. A lens passes it as its `icon` in `routeLensFacet.of`.
 */
export const StandardsIcon = ({ size = 16 }: IconProps): ReactElement => (
  <svg aria-hidden="true" {...buildGlyphProps(size)}>
    <path d="M8 2 13 4v4c0 3.2-2.2 5.3-5 6-2.8-.7-5-2.8-5-6V4l5-2z" />
    <path d="M5.8 8l1.6 1.6L10.5 6.5" />
  </svg>
);

/**
 * Guides: a page with two lines of text, the Guides lens's rail glyph.
 *
 * A stroke glyph `size` pixels square (16 by default), drawn in
 * `currentColor` and `aria-hidden`: the rail entry's visible label names
 * it. A lens passes it as its `icon` in `routeLensFacet.of`.
 */
export const GuidesIcon = ({ size = 16 }: IconProps): ReactElement => (
  <svg aria-hidden="true" {...buildGlyphProps(size)}>
    <path d="M3 3h7a3 3 0 0 1 3 3v7H6a3 3 0 0 1-3-3V3z" />
    <path d="M6 6h4M6 9h4" />
  </svg>
);

/**
 * Journeys: a path stepping left to right, the Journeys lens's rail glyph.
 *
 * A stroke glyph `size` pixels square (16 by default), drawn in
 * `currentColor` and `aria-hidden`: the rail entry's visible label names
 * it. A lens passes it as its `icon` in `routeLensFacet.of`.
 */
export const JourneysIcon = ({ size = 16 }: IconProps): ReactElement => (
  <svg aria-hidden="true" {...buildGlyphProps(size)}>
    <circle cx="3.5" cy="4" r="1.6" />
    <circle cx="12.5" cy="12" r="1.6" />
    <path d="M3.5 5.6v3.9a2 2 0 0 0 2 2h5.4" />
  </svg>
);
