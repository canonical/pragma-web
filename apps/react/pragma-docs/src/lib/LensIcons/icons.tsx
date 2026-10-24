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
