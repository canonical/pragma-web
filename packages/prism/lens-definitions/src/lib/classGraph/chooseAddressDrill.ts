import type { ClassGraphInput } from "./types.js";

/**
 * Choose the namespace the explorer's address drills into: the prefix its
 * `expand=` parameter names, when a namespace of the graph holds a class
 * by that prefix. A term page keeps its selection's drill and ignores the
 * parameter; an address with none, or one naming no namespace of the
 * graph, drills into nothing, so the overview is drawn at rest.
 *
 * @param input - The whole graph's classes.
 * @param expand - The address's `expand=` parameter, if any.
 * @param term - The selected term, compact, if any.
 * @returns The prefix to drill into, or `undefined`.
 */
export default function chooseAddressDrill(
  input: Pick<ClassGraphInput, "classes">,
  expand: string | undefined,
  term: string | undefined,
): string | undefined {
  if (term !== undefined || expand === undefined) return undefined;
  return input.classes.some((klass) => klass.prefix === expand)
    ? expand
    : undefined;
}
