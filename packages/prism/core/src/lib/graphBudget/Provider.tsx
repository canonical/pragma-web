import type { ReactElement } from "react";
import GraphBudgetContext from "./Context.js";
import { GRAPH_BUDGET } from "./constants.js";
import type { GraphBudgetProviderProps } from "./types.js";

/**
 * Provides the site's graph budget to every `useGraphBudget` below it. The
 * site mounts it once, with the budget `createGraphBudget` built.
 *
 * It renders no element of its own (a context provider), so it takes no
 * native props.
 *
 * `import { GraphBudgetProvider } from "@canonical/prism-core";`
 */
export default function GraphBudgetProvider({
  budget = GRAPH_BUDGET,
  children,
}: GraphBudgetProviderProps): ReactElement {
  return <GraphBudgetContext value={budget}>{children}</GraphBudgetContext>;
}
