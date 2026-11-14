import { useContext } from "react";
import GraphBudgetContext from "../Context.js";
import type { GraphBudget } from "../types.js";

/**
 * The graph budget a renderer keeps: the site's, from the nearest
 * `GraphBudgetProvider`, or the defaults when none is mounted.
 *
 * @returns The budget.
 */
export default function useGraphBudget(): GraphBudget {
  return useContext(GraphBudgetContext);
}
