import { compareText, orderBy } from "./geometry.js";
import { requireAt, requireEntry } from "./require.js";
import type { ClassGraphModel, RegionLayout } from "./types.js";

/**
 * Order a region's classes for the rail: the subclass forest in pre-order,
 * a parent before its children and children in column order, so every
 * column's top-to-bottom order equals the rail's. A class placed by its
 * relations follows the tree its first relation predecessor belongs to,
 * kept before the next tree below it in its column.
 *
 * @param model - The class graph's model.
 * @param region - The region's layout.
 * @returns The region's classes in rail order.
 */
export default function orderRail(
  model: ClassGraphModel,
  region: RegionLayout,
): string[] {
  const firstColumn = requireAt(region.columns, 0).filter((id) =>
    region.nodes.has(id),
  );
  const rootOf = (id: string): string => {
    const parent = model.parent.get(id);
    return parent === undefined ? id : rootOf(parent);
  };
  // A class not in a tree rooted in the first column follows its first
  // relation predecessor's anchor. Back edges are removed, so the walk ends,
  // and a class placed by its relations has a predecessor by construction.
  const anchorOf = (id: string): number => {
    const root = rootOf(id);
    if (
      firstColumn.includes(root) &&
      (model.parent.has(id) || region.columnOf(id) === 0)
    ) {
      return firstColumn.indexOf(root);
    }
    return anchorOf(
      requireAt([...region.predecessorsOf(id)].sort(compareText), 0),
    );
  };
  const keys = new Map<string, readonly number[]>(
    firstColumn.map((id, index) => [id, [index, 0, 0, 0]]),
  );
  region.columns.forEach((stack, column) => {
    if (column === 0) return;
    const classes = stack.filter((id) => region.nodes.has(id));
    let lastTree = -1;
    let previous = -1;
    classes.forEach((id, position) => {
      if (model.parent.has(id)) {
        lastTree = firstColumn.indexOf(rootOf(id));
        previous = Math.max(previous, lastTree);
        return;
      }
      const next = classes
        .slice(position + 1)
        .find((later) => model.parent.has(later));
      const nextTree =
        next === undefined
          ? Number.POSITIVE_INFINITY
          : firstColumn.indexOf(rootOf(next));
      const key = Math.max(
        previous,
        lastTree,
        Math.min(anchorOf(id), nextTree - 1),
      );
      previous = key;
      keys.set(id, [key, 1, column, position]);
    });
  });
  const roots = [...keys.keys()].sort((a, b) => {
    const x = requireEntry(keys, a);
    const y = requireEntry(keys, b);
    return orderBy(...x.map((value, at) => value - requireAt(y, at)));
  });
  const order: string[] = [];
  const visit = (id: string): void => {
    order.push(id);
    const children = [...(model.children.get(id) ?? [])].sort(
      (a, b) =>
        requireEntry(region.nodes, a).order -
        requireEntry(region.nodes, b).order,
    );
    children.forEach(visit);
  };
  roots.forEach(visit);
  return order;
}
