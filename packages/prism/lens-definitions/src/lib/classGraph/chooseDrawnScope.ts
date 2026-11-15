import {
  compareText,
  type GraphBudget,
  requireAt,
  requireEntry,
} from "@canonical/prism-core";
import nameStub from "./nameStub.js";
import type { ClassGraphModel, DrawnScope } from "./types.js";

/**
 * Choose what the overview draws at rest within its budget: every
 * namespace class by class, with an external stub for each class outside
 * the loaded namespaces that a drawn class's relation reaches; then, while
 * the classes, the collapsed boxes and the stubs together exceed the
 * budget's drawn nodes, the largest namespace still drawn class by class
 * (by class count, then prefix by code unit) collapses to one box, its
 * stubs going with it. A namespace too large for the budget alone ends
 * collapsed like the rest.
 *
 * @param model - The whole graph's model.
 * @param budget - The budget the view keeps; its `drawnNodesMax` counts.
 * @returns The prefixes expanded and collapsed, and the stubs' IRIs.
 */
export default function chooseDrawnScope(
  model: ClassGraphModel,
  budget: GraphBudget,
): DrawnScope {
  const loaded = new Set(model.regionOrder.map(({ prefix }) => prefix));
  const listStubs = (expanded: ReadonlySet<string>): string[] =>
    [
      ...new Set(
        model.external
          .filter(
            (relation) =>
              expanded.has(requireEntry(model.byId, relation.domain).prefix) &&
              !loaded.has(nameStub(relation.range).prefix),
          )
          .map((relation) => relation.range),
      ),
    ].sort(compareText);
  // The model's regions run largest first, then by prefix.
  let expanded = model.regionOrder;
  const collapsed: string[] = [];
  const countDrawn = (): number =>
    expanded.reduce((sum, region) => sum + region.ids.length, 0) +
    collapsed.length +
    listStubs(new Set(expanded.map(({ prefix }) => prefix))).length;
  while (expanded.length > 0 && countDrawn() > budget.drawnNodesMax) {
    collapsed.push(requireAt(expanded, 0).prefix);
    expanded = expanded.slice(1);
  }
  const prefixes = expanded.map(({ prefix }) => prefix);
  return {
    expanded: prefixes,
    collapsed,
    stubs: listStubs(new Set(prefixes)),
  };
}
