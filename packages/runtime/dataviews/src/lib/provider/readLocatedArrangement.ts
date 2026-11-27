import type { ViewPresentation } from "../presentation/index.js";
import { readArrangementParams, spellArrangementKey } from "../wire/index.js";

/**
 * Each table's order and hidden columns a location carries, as presentation
 * keys, or null.
 */
export default function readLocatedArrangement(
  params: URLSearchParams | undefined,
): ViewPresentation | null {
  const carried =
    params === undefined ? new Map() : readArrangementParams(params);
  if (carried.size === 0) {
    return null;
  }
  const presentation: Record<string, readonly string[]> = {};
  for (const [table, { order, hidden }] of carried) {
    if (order !== null) {
      presentation[spellArrangementKey(table, "order")] = order;
    }
    presentation[spellArrangementKey(table, "hidden")] = hidden;
  }
  return presentation;
}
