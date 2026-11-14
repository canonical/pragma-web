/**
 * The graph budgets: what one graph view may draw, fetch and ship, as named
 * constants a site changes once, at build, and never a reader.
 *
 * The constants are the defaults; `createGraphBudget` builds the site's
 * budget from them, a bare number only tightening one and loosening one
 * taking a reason; `GraphBudgetProvider` hands that budget down and
 * `useGraphBudget` reads it in a graph view, so every view counts against
 * one record and no view keeps a number of its own.
 *
 * @note `GraphBudgetProvider` and `useGraphBudget` read React context;
 *   the constants and `createGraphBudget` are pure.
 *
 * @module
 */

export {
  GRAPH_BAND_MEMBERS_MAX,
  GRAPH_BUDGET,
  GRAPH_DRAWN_NODES_MAX,
  GRAPH_FETCHED_NODES_MAX,
  GRAPH_LABEL_PX_MIN,
  GRAPH_SVG_BYTES_MAX,
  GRAPH_SVG_ELEMENTS_MAX,
} from "./constants.js";
export { default as createGraphBudget } from "./createGraphBudget.js";
export { default as useGraphBudget } from "./hooks/useGraphBudget.js";
export { default as GraphBudgetProvider } from "./Provider.js";
export type {
  GraphBudget,
  GraphBudgetOverrides,
  GraphBudgetProviderProps,
  GraphBudgetRaise,
} from "./types.js";
