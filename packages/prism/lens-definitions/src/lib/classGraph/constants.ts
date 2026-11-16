/**
 * The class graph's own lengths, on the layered engine's 16px lattice:
 * its boxes, channels, shelves, hubs, camera fits and phone view. The
 * lengths every layered region shares, and the font metrics labels are
 * measured with, are the engine's, in `@canonical/prism-core`.
 */

import {
  BUS_OFFSET,
  COLLISION_MARGIN,
  ceilTo,
  GRAPH_LABEL_PX_MIN,
  LABEL_HALO,
  LABEL_SIZE,
  LATTICE,
  REGION_LABEL_SIZE,
} from "@canonical/prism-core";
import type { StrokeWidth } from "./types.js";

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

/**
 * The smallest zoom at which every label, set at `LABEL_SIZE`, renders at
 * the graph budget's `GRAPH_LABEL_PX_MIN` or more.
 */
export const MIN_FIT = GRAPH_LABEL_PX_MIN / LABEL_SIZE;

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

/**
 * The camera's greatest zoom, as the graph canvas clamps it: a region's
 * window is never so small that the camera would show more than it.
 */
export const FRAME_ZOOM_MAX = 2.4;

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

/**
 * The instance counts at which a relation's stroke steps up, heaviest
 * first: a decade per step, so the width tells the order of magnitude of
 * the statements it covers. A count below the last step is drawn at 1px.
 */
export const STROKE_STEPS: readonly {
  readonly from: number;
  readonly width: StrokeWidth;
}[] = [
  { from: 1000, width: 8 },
  { from: 100, width: 4 },
  { from: 10, width: 2 },
];

/** The stroke of a relation below the first step, in px. */
export const STROKE_MIN_WIDTH: StrokeWidth = 1;

/**
 * The arrowhead a heavy relation ends in, by its stroke width: its length
 * and width, in px, grown from the 8px head so the head stays wider than
 * its line (half again as wide at 4px, two and a half times at 8px). The
 * line stops its own width short of the tip, where the head is as wide
 * as the line, so it ends inside the head instead of overrunning its
 * point. Lighter strokes keep the 8px head and run to the tip.
 */
export const HEAVY_HEAD_SIZES: Readonly<Partial<Record<StrokeWidth, number>>> =
  { 4: 12, 8: 20 };

/** The dash pattern of a relation no statement instantiates, in px. */
export const ZERO_STROKE_DASH = "4 4";

/**
 * The type size of a bridge's label, in px: a region prefix's, so it
 * stays legible from the zoom at which the prefixes are drawn.
 */
export const BRIDGE_LABEL_SIZE = REGION_LABEL_SIZE;

/** How many relations a bridge's label names before it counts them. */
export const BRIDGE_LABEL_NAMES = 2;

/** What a bridge's label joins the names of its relations with. */
export const BRIDGE_LABEL_SEPARATOR = " · ";

/**
 * How far apart the lanes of the bridges that run along one channel, gap
 * or margin run, in px, where it has room: each bridge keeps a stretch of
 * route of its own, so no line is drawn over another.
 */
export const BRIDGE_LANE = 8;

/**
 * How much of a gap between regions or shelves, or of a margin, the lanes
 * of the bridges that run along it may spread over, in px: the gap less a
 * lane's clearance from the boxes on either side.
 */
export const BRIDGE_GAP_ROOM = SHELF_GAP - 2 * BRIDGE_LANE;

/**
 * How much of a channel between two columns the lanes of the bridges that
 * run along it may spread over, in px: the room either side of the channel's
 * middle, short of the subclass bus before it and of the next column's
 * boxes after it, in the narrower of the two channels the packer uses.
 */
export const BRIDGE_CHANNEL_ROOM =
  2 * (CROSS_CHANNEL_OFFSET - BUS_OFFSET - BRIDGE_LANE / 2);

/**
 * How many bridges a channel may hold for its lanes to be ordered by
 * trying every order (720 at six); a fuller channel keeps its runs in the
 * order they start along it.
 */
export const LANE_ORDER_SEARCH_LIMIT = 6;

/**
 * How far below a pair of neighbours joined straight across their gap the
 * graph reaches, in px, on the lattice: with the view margin, room for a
 * bridge's label, its halo and its clearance from the boxes, under the
 * pair when the route is too short to carry it.
 */
export const BRIDGE_LABEL_BAND = ceilTo(
  BRIDGE_LABEL_SIZE + 2 * LABEL_HALO + COLLISION_MARGIN - VIEW_MARGIN,
  LATTICE,
);

/**
 * How far a bridge's label slides along its route between the places it
 * tries, in px, from the route's arrowhead back.
 */
export const BRIDGE_LABEL_STEP = 4;

/**
 * The narrowest a collapsed region's box is drawn, in px: its prefix over
 * its class count, which needs more room than a class's one line.
 */
export const REGION_BOX_MIN_WIDTH = 128;

/**
 * What a collapsed region's box is keyed by, before its prefix: no IRI a
 * provider serves starts so.
 */
export const REGION_NODE_SCHEME = "region:";

/**
 * The prefixes of the well-known vocabularies a relation may reach without
 * their ontology being loaded, by namespace: the W3C's, FOAF, SKOS and
 * Dublin Core. The store serves the lens no namespace inventory beyond
 * the loaded ontologies, and these vocabularies' IRIs carry no readable
 * prefix.
 */
export const STUB_PREFIXES: ReadonlyMap<string, string> = new Map([
  ["http://www.w3.org/1999/02/22-rdf-syntax-ns#", "rdf"],
  ["http://www.w3.org/2000/01/rdf-schema#", "rdfs"],
  ["http://www.w3.org/2001/XMLSchema#", "xsd"],
  ["http://www.w3.org/2002/07/owl#", "owl"],
  ["http://www.w3.org/2004/02/skos/core#", "skos"],
  ["http://xmlns.com/foaf/0.1/", "foaf"],
  ["http://purl.org/dc/terms/", "dcterms"],
  ["http://purl.org/dc/elements/1.1/", "dc"],
]);

/**
 * How far a rectangle may overrun another, in px, and still count as
 * inside it: a window's edges are fractional where it is framed at the
 * legible zoom.
 */
export const FIT_TOLERANCE = 1e-6;

/**
 * The locale of the catalog in which the layout measures a box's text:
 * the layout is the same in every locale, so the server and the client
 * lay out the same graph.
 */
export const MEASURED_LOCALE = "en";
