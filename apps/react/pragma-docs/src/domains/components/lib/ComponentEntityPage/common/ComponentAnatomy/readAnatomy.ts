import {
  type Edge,
  type Node,
  parseAnatomyYAML,
  type Specification,
} from "@canonical/anatomy-dsl";

/** Whether an edge places a well-formed node, or a switch of well-formed cases. */
function isWellFormedEdge(edge: Edge): boolean {
  const { target, relation } = edge;
  if (typeof relation?.cardinality !== "string") return false;
  if ("cases" in target) {
    return (
      Array.isArray(target.cases) &&
      target.cases.every(({ node }) => isWellFormedNode(node))
    );
  }
  return isWellFormedNode(target);
}

/**
 * Whether a parsed node holds what the tree draws: a named node its URI,
 * an anonymous node its role, and every edge below it the same. The
 * parser reads any YAML mapping, so a text that is no anatomy parses to
 * nodes without them.
 */
function isWellFormedNode(node: Node | undefined): boolean {
  if (node === undefined) return false;
  const named = node.type === "named" && typeof node.uri === "string";
  const anonymous = node.type === "anonymous" && typeof node.role === "string";
  return (named || anonymous) && (node.edges ?? []).every(isWellFormedEdge);
}

/**
 * Read a block's anatomy from the graph's anatomy text. The text is the
 * graph's, an external boundary: an absent text, one the anatomy parser
 * refuses (a compound state, a legacy form), or one that parses to no
 * well-formed tree reads as no anatomy, so the page shows its line for a
 * block without one rather than failing.
 *
 * @param text - The block's `anatomyDsl`, as the graph holds it.
 * @returns The parsed anatomy, or `undefined` when there is none to read.
 */
export default function readAnatomy(
  text: string | null | undefined,
): Specification | undefined {
  if (text === null || text === undefined || text.trim() === "") {
    return undefined;
  }
  try {
    const specification = parseAnatomyYAML(text);
    return isWellFormedNode(specification.root) ? specification : undefined;
  } catch {
    return undefined;
  }
}
