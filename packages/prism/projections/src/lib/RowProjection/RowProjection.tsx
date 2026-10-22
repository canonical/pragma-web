import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import rowProjectionFragmentNode from "../../__generated__/RowProjection_node.graphql.js";
import { useProjectionMaps } from "../projections/index.js";
import type { RowProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The row's composite fragment: what dispatch reads, plus the `Node`
 * arm's fragment, spread at the top level because `Node` is the one arm
 * the row map holds.
 */
const rowProjectionFragmentSource = (): unknown => graphql`
  fragment RowProjection_node on Node {
    __typename
    _meta {
      curie
    }
    ...NodeRow_node
  }
`;
void rowProjectionFragmentSource;
/* v8 ignore stop */

/**
 * The list row: a node as one entry of a list of results. It renders the node
 * through the row map's arm for the node's `__typename`, falling back to the
 * `Node` arm, and hands the arm the node's home.
 *
 * It renders no element of its own; the arm renders the root, an `<li>`.
 *
 * `import { RowProjection } from "@canonical/prism-projections";`
 */
export default function RowProjection({
  node,
  ...props
}: RowProjectionProps): ReactElement {
  const data = useFragment(rowProjectionFragmentNode, node);
  const map = useProjectionMaps().row;
  const href = useHome({
    __typename: data.__typename,
    uri: data._meta.curie,
  });
  const Arm = map[data.__typename] ?? map.Node;
  return <Arm {...props} href={href} node={data} />;
}
