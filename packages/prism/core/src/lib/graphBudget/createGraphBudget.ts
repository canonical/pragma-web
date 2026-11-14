import { GRAPH_BUDGET } from "./constants.js";
import type { GraphBudget, GraphBudgetOverrides } from "./types.js";

/**
 * The budget a site builds with: every default, with the site's overrides
 * applied once, at build. Only the site calls it; no URL parameter or
 * reader setting reaches it.
 *
 * A bare number may only make a budget stricter: lower for a maximum,
 * higher for `labelPxMin`. Loosening one takes `{ value, reason }` with a
 * reason that says why.
 *
 * @param overrides - The site's changes, by budget.
 * @returns The site's budget.
 * @throws When a key names no budget, a budget is loosened without a
 *   reason, a value is not a positive finite number, or a maximum is not a
 *   whole number.
 */
export default function createGraphBudget(
  overrides: GraphBudgetOverrides = {},
): GraphBudget {
  const budget: Record<keyof GraphBudget, number> = { ...GRAPH_BUDGET };
  for (const key of Object.keys(overrides) as (keyof GraphBudget)[]) {
    if (!Object.hasOwn(GRAPH_BUDGET, key)) {
      throw new Error(`createGraphBudget: ${key} is not a graph budget`);
    }
    const override = overrides[key];
    if (override === undefined) continue;
    const value = typeof override === "number" ? override : override.value;
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`createGraphBudget: ${key} must be a positive number`);
    }
    if (key !== "labelPxMin" && !Number.isInteger(value)) {
      throw new Error(`createGraphBudget: ${key} must be a whole number`);
    }
    const loosens =
      key === "labelPxMin"
        ? value < GRAPH_BUDGET[key]
        : value > GRAPH_BUDGET[key];
    const reason = typeof override === "number" ? "" : override.reason.trim();
    if (loosens && reason === "") {
      throw new Error(
        `createGraphBudget: ${key} past its default of ${GRAPH_BUDGET[key]} needs a reason`,
      );
    }
    budget[key] = value;
  }
  return budget;
}
