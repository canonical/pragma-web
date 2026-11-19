import { compareText, type GraphBudget } from "@canonical/prism-core";
import type {
  AnyRelationInput,
  ClassGraphInput,
  ClassGraphModel,
  DrawnScope,
  SpecimenGraphInput,
} from "./types.js";

/**
 * Gather the input a term page lays out: its class's one-hop
 * neighbourhood over both edge kinds. That is the focus class, its
 * superclass, its subclasses, every class one relation away in either
 * direction, whatever its namespace, and an
 * external stub for each range outside the graph; the relations with the
 * focus as an end join them. Each namespace with a class in it is drawn
 * class by class, holding only those classes. Past the budget's drawn
 * nodes, the neighbours joined by the most relations stay (then by IRI,
 * by code unit), and the findings name the rest.
 *
 * @param input - The whole graph's input.
 * @param model - The whole graph's model, for its namespaces' order.
 * @param focus - The focus class's IRI, a class of the input.
 * @param budget - The budget the view keeps; its `drawnNodesMax` counts.
 * @returns The input to lay out, the scope it is drawn in, and what the
 *   budget left out, in words.
 */
export default function gatherNeighbourhoodInput<
  Input extends ClassGraphInput | SpecimenGraphInput,
>(
  input: Input,
  model: ClassGraphModel,
  focus: string,
  budget: GraphBudget,
): {
  readonly input: Input;
  readonly scope: DrawnScope;
  readonly findings: readonly string[];
} {
  const classes = new Map(input.classes.map((klass) => [klass.uri, klass]));
  const superclass = classes.get(focus)?.superclass ?? null;
  const touching = (input.relations as readonly AnyRelationInput[]).filter(
    (relation) => relation.domain === focus || relation.range === focus,
  );
  // How many relations join the focus to each other end.
  const joins = new Map<string, number>();
  for (const relation of touching) {
    const other = relation.domain === focus ? relation.range : relation.domain;
    if (other === null || other === focus || other === superclass) continue;
    joins.set(other, (joins.get(other) ?? 0) + 1);
  }
  // A subclass is one hop away by the other edge kind.
  for (const klass of input.classes) {
    if (klass.superclass !== focus || klass.uri === focus) continue;
    joins.set(klass.uri, (joins.get(klass.uri) ?? 0) + 1);
  }
  const fixed = [focus, superclass].filter(
    (uri): uri is string => uri !== null && classes.has(uri),
  );
  const ranked = [...joins].sort(
    ([a, joinsA], [b, joinsB]) => joinsB - joinsA || compareText(a, b),
  );
  const room = Math.max(0, budget.drawnNodesMax - fixed.length);
  const kept = new Set([
    ...fixed,
    ...ranked.slice(0, room).map(([uri]) => uri),
  ]);
  const findings = ranked
    .slice(room)
    .map(([uri]) => `The neighbourhood leaves out ${uri}: past the budget.`);
  const relations = touching.filter(
    (relation) =>
      relation.domain !== null &&
      relation.range !== null &&
      kept.has(relation.domain) &&
      kept.has(relation.range),
  );
  const drawn = input.classes.filter((klass) => kept.has(klass.uri));
  const prefixes = new Set(drawn.map((klass) => klass.prefix));
  return {
    input: { ...input, classes: drawn, relations },
    scope: {
      expanded: model.regionOrder
        .map(({ prefix }) => prefix)
        .filter((prefix) => prefixes.has(prefix)),
      collapsed: [],
      stubs: [...kept].filter((uri) => !classes.has(uri)).sort(compareText),
    },
    findings,
  };
}
