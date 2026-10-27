import type { JourneyGraphNode } from "./types.js";

/**
 * Read a placed hop by its id. The layout connects only hops it has
 * placed, so an edge to any other id is a layout bug, reported here rather
 * than as a missing coordinate later in the render.
 *
 * @param byId - The placed hops, by id.
 * @param id - The id an edge names.
 * @returns The hop.
 * @throws When no hop with that id was placed.
 */
export default function requireHop(
  byId: ReadonlyMap<string, JourneyGraphNode>,
  id: string,
): JourneyGraphNode {
  const hop = byId.get(id);
  if (hop === undefined) {
    throw new Error(`the journey layout connects ${id}, which it never placed`);
  }
  return hop;
}
