import type { Edge, Node, Specification } from "@canonical/anatomy-dsl";
import type { ReaderFragment, ReaderSelection } from "relay-runtime";

/**
 * Join a scope and a field into one dot-delimited path.
 */
function joinPath(scope: string, field: string): string {
  return scope === "" ? field : `${scope}.${field}`;
}

/**
 * Collect the field paths a node of an anatomy and everything below it
 * read, each relative to the root's context: a node's `projection.field` is
 * read in the scope it sits in.
 */
function collectNodePaths(node: Node, scope: string): string[] {
  const field = node.projection?.field;
  return [
    ...(field === undefined ? [] : [joinPath(scope, field)]),
    ...(node.edges ?? []).flatMap((edge) => collectEdgePaths(edge, scope)),
  ];
}

/**
 * Collect the field paths an edge's target reads: a relation's
 * `projection.field` shifts the scope its target reads in, and every case
 * of a switch reads in the scope the switch sits in.
 */
function collectEdgePaths(edge: Edge, scope: string): string[] {
  const traversal = edge.relation.projection?.field;
  const inner = traversal === undefined ? scope : joinPath(scope, traversal);
  const { target } = edge;
  if ("cases" in target) {
    return target.cases.flatMap(({ node }) => collectNodePaths(node, inner));
  }
  return collectNodePaths(target, inner);
}

/**
 * Collect the scalar paths a fragment's selections read: a linked field
 * nests its selections under its name, a scalar field ends a path, and an
 * inline fragment or a condition reads in the scope it sits in. The
 * typename and fragment spreads read no field the anatomy renders.
 */
function collectFragmentPaths(
  selections: readonly ReaderSelection[],
  scope: string,
): string[] {
  return selections.flatMap((selection) => {
    switch (selection.kind) {
      case "ScalarField":
        return selection.name === "__typename"
          ? []
          : [joinPath(scope, selection.name)];
      case "LinkedField":
        return collectFragmentPaths(
          selection.selections,
          joinPath(scope, selection.name),
        );
      case "InlineFragment":
      case "Condition":
        return collectFragmentPaths(selection.selections, scope);
      default:
        return [];
    }
  });
}

/**
 * Assert a projected anatomy and the Relay fragment of its component read
 * the same data: the anatomy's root narrows to the fragment's type through
 * `projection.on`, and the field paths the anatomy derives are exactly the
 * scalar paths the fragment reads. The anatomy derives its paths as the
 * DSL's derived fragment does: a relation's `field` shifts the scope, a
 * node's `field` is read in it, and a switch's cases inherit it.
 *
 * @param specification - The component's parsed anatomy.
 * @param fragment - The compiled reader artifact of the component's
 *   fragment.
 * @throws With every path the anatomy reads and the fragment does not, and
 *   every path the fragment reads and the anatomy does not, one per line,
 *   or when the two are on different types.
 */
export default function assertProjectionMatchesFragment(
  specification: Specification,
  fragment: ReaderFragment,
): void {
  const { root } = specification;
  const on = root.projection?.on;
  if (on !== fragment.type) {
    throw new Error(
      `${root.uri} projects on ${on ?? "no type"}, but ${fragment.name} is on ${fragment.type}`,
    );
  }
  const anatomyPaths = new Set(collectNodePaths(root, ""));
  const fragmentPaths = new Set(collectFragmentPaths(fragment.selections, ""));
  const problems = [
    ...[...anatomyPaths]
      .filter((path) => !fragmentPaths.has(path))
      .map(
        (path) => `the anatomy reads ${path}, which ${fragment.name} does not`,
      ),
    ...[...fragmentPaths]
      .filter((path) => !anatomyPaths.has(path))
      .map(
        (path) => `${fragment.name} reads ${path}, which the anatomy does not`,
      ),
  ];
  if (problems.length > 0) {
    throw new Error(
      `${root.uri} and ${fragment.name} read different fields:\n${problems.join("\n")}`,
    );
  }
}
