import type { ClassGraphLayout } from "./types.js";

/**
 * Find a focus class's one-hop neighbourhood over both edge kinds: the
 * classes its relations reach, its superclass and its subclasses, and the
 * edges that join them. Everything outside it fades.
 *
 * @param layout - The class graph's layout.
 * @param focus - The focus class's IRI.
 * @returns The neighbourhood's classes and edge ids.
 */
export default function findNeighbourhood(
  layout: ClassGraphLayout,
  focus: string,
): {
  readonly nodes: ReadonlySet<string>;
  readonly edges: ReadonlySet<string>;
} {
  const nodes = new Set([focus]);
  const edges = new Set<string>();
  for (const edge of layout.edges) {
    if (edge.from !== focus && !edge.to.includes(focus)) continue;
    edges.add(edge.id);
    nodes.add(edge.from);
    // A subclass reaches its superclass but not its siblings.
    if (edge.kind === "relation" || edge.from === focus) {
      for (const id of edge.to) nodes.add(id);
    }
  }
  return { nodes, edges };
}
