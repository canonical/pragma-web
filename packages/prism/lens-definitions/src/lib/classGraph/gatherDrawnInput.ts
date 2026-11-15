import { requireEntry } from "@canonical/prism-core";
import { REGION_NODE_SCHEME } from "./constants.js";
import nameStubs from "./nameStubs.js";
import type {
  AnyRelationInput,
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
 * its classes and the relations it holds) and one per external stub (named
 * by its compact term, which no other stub and no loaded namespace
 * shares, in a region of its own prefix). A relation with an
 * end inside a collapsed namespace is drawn from that namespace's box,
 * keeping its count: a bridge when its other end lies in another
 * namespace or is a stub. A relation with both ends inside one box is not
 * drawn; the box counts it. A superclass link whose end is not drawn is
 * left out by the model.
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
  const collapsed = new Set(scope.collapsed);
  const sizes = new Map(
    model.regionOrder.map(({ prefix, ids }) => [prefix, ids.length]),
  );
  const boxOf = (uri: string | null): string | null => {
    const prefix = uri === null ? undefined : model.byId.get(uri)?.prefix;
    return prefix !== undefined && collapsed.has(prefix)
      ? `${REGION_NODE_SCHEME}${prefix}`
      : uri;
  };
  // No two stubs share a name, and none takes a loaded prefix.
  const stubNames = nameStubs(
    scope.stubs,
    new Set(model.regionOrder.map(({ prefix }) => prefix)),
  );
  const held = new Map<string, number>();
  const relations: AnyRelationInput[] = [];
  for (const relation of input.relations as readonly AnyRelationInput[]) {
    const domain = boxOf(relation.domain);
    const range = boxOf(relation.range);
    if (domain === range && domain !== relation.domain && domain !== null) {
      held.set(domain, (held.get(domain) ?? 0) + 1);
      continue;
    }
    relations.push(
      domain === relation.domain && range === relation.range
        ? relation
        : { ...relation, domain, range },
    );
  }
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
    held: held.get(uri) ?? 0,
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
        const { prefix, term } = requireEntry(stubNames, iri);
        return box(iri, prefix, term, "stub", 1);
      }),
    ],
    relations,
  };
}
