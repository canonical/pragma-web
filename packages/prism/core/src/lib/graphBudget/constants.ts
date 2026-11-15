import type { GraphBudget } from "./types.js";

/** R15: nodes one graph view draws, every one labelled. */
export const GRAPH_DRAWN_NODES_MAX = 40;

/** R15: members a band shows before it groups the rest under a count. */
export const GRAPH_BAND_MEMBERS_MAX = 12;

/** R15: nodes one query fetches; totals stay true beyond it. */
export const GRAPH_FETCHED_NODES_MAX = 200;

/** R15: bytes of one page's graph SVG (about 64 KB). */
export const GRAPH_SVG_BYTES_MAX = 65_536;

/** R15: elements of one page's graph SVG. */
export const GRAPH_SVG_ELEMENTS_MAX = 500;

/** R15, R31: the smallest label a drawn node may carry at Fit, in CSS pixels. */
export const GRAPH_LABEL_PX_MIN = 12;

/** Every graph budget at its default, as one record. */
export const GRAPH_BUDGET = {
  drawnNodesMax: GRAPH_DRAWN_NODES_MAX,
  bandMembersMax: GRAPH_BAND_MEMBERS_MAX,
  fetchedNodesMax: GRAPH_FETCHED_NODES_MAX,
  svgBytesMax: GRAPH_SVG_BYTES_MAX,
  svgElementsMax: GRAPH_SVG_ELEMENTS_MAX,
  labelPxMin: GRAPH_LABEL_PX_MIN,
} as const satisfies GraphBudget;
