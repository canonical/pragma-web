import type { ClassEdgeInput } from "../../../../classGraph/types.js";
import type { RelationEntry } from "../RelationList/types.js";

/**
 * Give each of a class's relations the statements the graph serves on its
 * edge, and order them the heaviest first (a relation with no served edge
 * last, each keeping its place among equals), so that a relation whose
 * label the canvas could not seat is named, with its count, here.
 *
 * @param entries - The relations, one way, as the class view lists them.
 * @param edges - The class edges the graph counts.
 * @param self - The class the relations run from or to.
 * @param direction - Which way they run from it.
 * @returns The relations with their counts, the heaviest first.
 */
export default function weighRelationEntries(
  entries: readonly RelationEntry[],
  edges: readonly ClassEdgeInput[],
  self: string,
  direction: "outgoing" | "incoming",
): readonly RelationEntry[] {
  const weighed = entries.map((entry) => {
    const other = entry.other?.uri;
    const [subject, object] =
      direction === "outgoing" ? [self, other] : [other, self];
    const edge = edges.find(
      (candidate) =>
        candidate.property === entry.predicate.uri &&
        candidate.subjectClass === subject &&
        candidate.objectClass === object,
    );
    return edge === undefined ? entry : { ...entry, count: edge.count };
  });
  return weighed
    .map((entry, index) => ({ entry, index }))
    .sort(
      (a, b) =>
        (b.entry.count ?? -1) - (a.entry.count ?? -1) || a.index - b.index,
    )
    .map(({ entry }) => entry);
}
