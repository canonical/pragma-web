import type { ClassGraphInput, ClassGraphLayout } from "./types.js";

/**
 * Choose the namespace a term page drills into: the selected class's own,
 * when the overview at rest draws that namespace as one box, so the class
 * is drawn, focused and reachable by the keyboard. A class the overview
 * draws, a term that is no class of the graph, or no selection, drills
 * into nothing.
 *
 * @param input - The whole graph's classes.
 * @param layout - The overview at rest.
 * @param selected - The selected term's IRI, if any.
 * @returns The prefix to drill into, or `undefined`.
 */
export default function chooseSelectionDrill(
  input: Pick<ClassGraphInput, "classes">,
  layout: Pick<ClassGraphLayout, "nodes" | "regions">,
  selected: string | undefined,
): string | undefined {
  if (selected === undefined || layout.nodes.has(selected)) return undefined;
  const prefix = input.classes.find((klass) => klass.uri === selected)?.prefix;
  return layout.regions.some(
    (region) => region.prefix === prefix && region.collapsed,
  )
    ? prefix
    : undefined;
}
