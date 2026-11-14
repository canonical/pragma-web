/**
 * The class graph's geometry and type: every length the layout places by,
 * on a 16px lattice (boxes, columns, rows, regions and waypoints sit on
 * multiples of 16; ports, arrowheads and labels on the 4px grid inside
 * them), and the advance widths of the shipped font the layout measures
 * labels with, so no browser measures anything.
 */

import { BUS_OFFSET, LATTICE } from "@canonical/prism-core";

/** The finer grid ports, arrowheads and labels sit on inside a box, in px. */
export const FINE_GRID = 4;

/** A class box's height, in px. */
export const BOX_HEIGHT = 32;

/** A hub's box height, in px: the room a hub's ports need. */
export const HUB_HEIGHT = 48;

/** A box whose label wraps to two lines, in px. */
export const WRAPPED_HEIGHT = 64;

/** The narrowest a box is drawn, in px. */
export const BOX_MIN_WIDTH = 96;

/** The widest a box is drawn, in px; a longer label wraps to two lines. */
export const BOX_MAX_WIDTH = 208;

/** The inset between a box's edge and its text, in px. */
export const BOX_INSET = 8;

/** The baselines of a wrapped label's two lines, from the box's top, in px. */
export const WRAPPED_BASELINES: readonly [number, number] = [26, 46];

/** The channel between two columns, in px. */
export const CHANNEL = 48;

/** The narrower channel the packer retries with when the fit is too small. */
export const FALLBACK_CHANNEL = 32;

/**
 * How far a relation between regions runs from a channel's left edge, in
 * px: half a lattice step past the subclass bus, so the two never share a
 * line at either channel width.
 */
export const CROSS_CHANNEL_OFFSET = BUS_OFFSET + LATTICE / 2;

/** The gap between two regions, on a shelf and between shelves, in px. */
export const SHELF_GAP = 48;

/** The margin the viewBox adds around the graph's bounds, in px. */
export const VIEW_MARGIN = 16;

/**
 * The canvas the layout is fitted for, in px: the Definitions well's
 * viewport at 1440 by 900, as measured in the browser (590.67 by 778),
 * where the site's
 * rail takes two columns, the term rail two and the inspector three, under
 * the canvas's controls bar. The packer keeps the shelf break with the
 * largest fit on it.
 */
export const DESIGN_CANVAS = { w: 590, h: 778 } as const;

/**
 * Where a region shorter than its shelf may sit, as a share of the room
 * left: the middle, the top, the bottom, tried in that order.
 */
export const REGION_ALIGNMENTS: readonly number[] = [0.5, 0, 1];

/**
 * Where a shelf narrower than the packing may sit, as a share of the room
 * left: flush left, the middle, flush right, tried in that order.
 */
export const SHELF_ALIGNMENTS: readonly number[] = [0, 0.5, 1];

/**
 * How many alignment choices the placement searches together: three
 * shares each, so at most 3 to this power placements are scored, however
 * many regions a site has.
 */
export const ALIGNMENT_SEARCH_LIMIT = 6;

/** The smallest zoom at which every 14px label renders at 12px or more. */
export const MIN_FIT = 12 / 14;

/**
 * How far above the legible zoom a window opens, as a factor, so the
 * browser's single-precision transforms never draw its 14px text a hair
 * below 12px.
 */
export const LEGIBLE_MARGIN = 1 + 1e-6;

/**
 * How much further than its first clean window, as a factor, the canvas
 * may zoom in to open on a window whose bottom edge crosses no box either:
 * one step of the zoom buttons.
 */
export const CLEAN_EDGE_ZOOM = 1.2;

/** A self-loop's extent above and right of its box, in px. */
export const LOOP_EXTENT = 16;

/** A hub's self-loop's extent above and right of its box, in px. */
export const HUB_LOOP_EXTENT = 32;

/** How many barycentre sweeps order the columns. */
export const SWEEPS = 4;

/** A class with this many incident edges, after bundling, is a hub. */
export const HUB_MIN_DEGREE = 4;

/** At most this many classes are hubs. */
export const HUB_CAP = 6;

/** The step a route's variant moves by, and the path sampling step, in px. */
export const ROUTE_STEP = 4;

/** The type size of a hub's label, in px. */
export const HUB_LABEL_SIZE = 16;

/**
 * The phone view: a 288px column, the well's width at 390 by 844 beside
 * the site's one-column rail, so its 14px labels render at 14px there;
 * boxes ending at the spine, arcs right of it.
 */
export const PHONE = {
  width: 288,
  spine: 192,
  header: 48,
  pitch: 48,
  indent: 16,
  arcCap: 88,
  inPort: 8,
  outPort: 24,
  loop: 16,
} as const;
