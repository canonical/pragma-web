import { requireEntry } from "@canonical/prism-core";
import { REGION_NODE_SCHEME } from "./constants.js";
import nameStub from "./nameStub.js";
import type {
  ClassGraphInput,
  ClassGraphModel,
  DrawnScope,
  GraphClassInput,
  SpecimenGraphInput,
} from "./types.js";

/**
 * Gather the input the overview lays out within its scope: the classes of
 * the expanded namespaces, one box per collapsed namespace (keyed by
 * `REGION_NODE_SCHEME` and its prefix, named by its prefix, standing for
 * its classes) and one per external stub (named by its compact term, in a
 * region of its own prefix), with every relation. A relation, or a
 * superclass link, whose end is not drawn is left out by the model.
 *
 * @param input - The whole graph's input.
 * @param model - The whole graph's model, for the namespaces' classes.
 * @param scope - What the overview draws.
 * @returns The input to lay out.
 */
export default function gatherDrawnInput<
  Input extends ClassGraphInput | SpecimenGraphInput,
>(input: Input, model: ClassGraphModel, scope: DrawnScope): Input {
  const expanded = new Set(scope.expanded);
  const sizes = new Map(
    model.regionOrder.map(({ prefix, ids }) => [prefix, ids.length]),
  );
  const box = (
    uri: string,
    prefix: string,
    term: string,
    kind: "stub" | "region",
    members: number,
  ): GraphClassInput => ({
    uri,
    label: term,
    prefix,
    abstract: false,
    superclass: null,
    instanceCount: 0,
    fields: 0,
    kind,
    members,
    term,
  });
  return {
    ...input,
    classes: [
      ...input.classes.filter((klass) => expanded.has(klass.prefix)),
      ...scope.collapsed.map((prefix) =>
        box(
          `${REGION_NODE_SCHEME}${prefix}`,
          prefix,
          prefix,
          "region",
          requireEntry(sizes, prefix),
        ),
      ),
      ...scope.stubs.map((iri) => {
        const { prefix, term } = nameStub(iri);
        return box(iri, prefix, term, "stub", 1);
      }),
    ],
  };
}
