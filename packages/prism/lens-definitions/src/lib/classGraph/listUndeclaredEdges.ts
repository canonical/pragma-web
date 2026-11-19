import { compareText, orderBy } from "@canonical/prism-core";
import type { ClassEdgeInput } from "./types.js";

/**
 * List the class edges the store observes but no property declares: a
 * property's statements between two classes its domain and range do not
 * name, counted above 0, by subject class, then property, then object
 * class.
 *
 * @param edges - The class edges the graph serves.
 * @returns The undeclared edges with statements, in reading order.
 */
export default function listUndeclaredEdges(
  edges: readonly ClassEdgeInput[],
): ClassEdgeInput[] {
  return edges
    .filter((edge) => edge.count > 0 && !edge.declared)
    .sort((a, b) =>
      orderBy(
        compareText(a.subjectClass, b.subjectClass),
        compareText(a.property, b.property),
        compareText(a.objectClass, b.objectClass),
      ),
    );
}
