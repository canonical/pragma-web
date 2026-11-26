import { readCondition } from "@canonical/dataviews-core";
import type { PlacedConjunct } from "../../../types.js";
import type { QuickFilterApplied } from "../types.js";

/**
 * A quick filter's applied values: every operand its field's conjuncts
 * hold, a presence or a bound counting one, and the condition they all
 * assert, where they assert one. Pure.
 *
 * @param conjuncts - The field's conjuncts.
 * @returns The count, and the shared condition.
 */
export default function readAppliedCount(
  conjuncts: readonly PlacedConjunct[],
): QuickFilterApplied {
  const count = conjuncts.reduce(
    (sum, { predicate }) => sum + Math.max(predicate.operands.length, 1),
    0,
  );
  const conditions = new Set(
    conjuncts.map(({ predicate }) => readCondition(predicate)),
  );
  const [condition] = conditions;
  return conditions.size === 1 ? { count, condition } : { count };
}
