import {
  compareText,
  type GraphBudget,
  requireAt,
} from "@canonical/prism-core";
import type { ClassGraphModel, DrawnScope } from "./types.js";

/**
 * Choose what the overview draws within its budget: an external stub for
 * each class outside the loaded namespaces that a relation reaches, and
 * the namespaces class by class, while the classes, the collapsed boxes
 * and the stubs together exceed the budget's drawn nodes the largest
 * namespace still drawn class by class (by class count, then prefix by
 * code unit) collapsing to one box. A namespace too large for the budget
 * alone ends collapsed like the rest. A relation from a collapsed
 * namespace still reaches its stub, from the namespace's box, so no stub
 * goes with a collapse.
 *
 * Drilled into a namespace, the view draws that namespace class by class
 * and every other one as a box, whatever the budget.
 *
 * @param model - The whole graph's model.
 * @param budget - The budget the view keeps; its `drawnNodesMax` counts.
 * @param drill - The prefix of the namespace a reader drilled into, if
 *   any.
 * @returns The prefixes expanded and collapsed, and the stubs' IRIs.
 */
export default function chooseDrawnScope(
  model: ClassGraphModel,
  budget: GraphBudget,
  drill?: string,
): DrawnScope {
  const stubs = [
    ...new Set(model.external.map((relation) => relation.range)),
  ].sort(compareText);
  if (drill !== undefined) {
    return {
      expanded: model.regionOrder
        .filter(({ prefix }) => prefix === drill)
        .map(({ prefix }) => prefix),
      collapsed: model.regionOrder
        .filter(({ prefix }) => prefix !== drill)
        .map(({ prefix }) => prefix),
      stubs,
    };
  }
  // The model's regions run largest first, then by prefix.
  let expanded = model.regionOrder;
  const collapsed: string[] = [];
  const countDrawn = (): number =>
    expanded.reduce((sum, region) => sum + region.ids.length, 0) +
    collapsed.length +
    stubs.length;
  while (expanded.length > 0 && countDrawn() > budget.drawnNodesMax) {
    collapsed.push(requireAt(expanded, 0).prefix);
    expanded = expanded.slice(1);
  }
  return {
    expanded: expanded.map(({ prefix }) => prefix),
    collapsed,
    stubs,
  };
}
