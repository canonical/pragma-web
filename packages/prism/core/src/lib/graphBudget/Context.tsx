import { createContext } from "react";
import { GRAPH_BUDGET } from "./constants.js";
import type { GraphBudget } from "./types.js";

/** The site's graph budget; the defaults outside a `GraphBudgetProvider`. */
const GraphBudgetContext = createContext<GraphBudget>(GRAPH_BUDGET);

export default GraphBudgetContext;
