import { compareText, orderBy, requireEntry } from "@canonical/prism-core";
import type { BoxedClass, ClassGraphModel } from "./types.js";

/**
 * Order the classes a collapsed namespace's box stands for as the rail
 * lists them: in pre-order of the namespace's own subclass tree, a parent
 * before its children, the roots and each class's children by label, then
 * IRI, by code unit; each at its depth below its root.
 *
 * @param model - The whole graph's model, which holds the namespace's
 *   classes and their superclasses.
 * @param prefix - The collapsed namespace's prefix.
 * @returns The namespace's classes in rail order, each with its depth.
 */
export default function orderBoxedClasses(
  model: ClassGraphModel,
  prefix: string,
): readonly BoxedClass[] {
  const byLabel = (a: string, b: string): number =>
    orderBy(
      compareText(
        requireEntry(model.byId, a).label,
        requireEntry(model.byId, b).label,
      ),
      compareText(a, b),
    );
  const ids = model.regionOrder.find((region) => region.prefix === prefix)?.ids;
  const ordered: BoxedClass[] = [];
  const visit = (uri: string, depth: number): void => {
    ordered.push({ uri, depth });
    for (const child of [...(model.children.get(uri) ?? [])].sort(byLabel)) {
      visit(child, depth + 1);
    }
  };
  for (const root of (ids ?? [])
    .filter((id) => !model.parent.has(id))
    .sort(byLabel)) {
    visit(root, 0);
  }
  return ordered;
}
