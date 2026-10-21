import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import entityRowFragmentNode from "../../__generated__/EntityRow_node.graphql.js";
import { useProjectionMaps } from "../projections/index.js";
import type { EntityRowProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The row's composite fragment: what dispatch reads, plus one spread per
 * arm in the row map. A type's own arm is spread inside an inline fragment
 * on that type, so the arm reads its own fields wherever the row renders.
 */
const entityRowFragmentSource = (): unknown => graphql`
  fragment EntityRow_node on Node {
    __typename
    _meta {
      curie
    }
    ...NodeRow_node
  }
`;
void entityRowFragmentSource;
/* v8 ignore stop */

/**
 * The list row: a node as one entry of a list of results. It renders the node through the row map's arm for the node's
 * `__typename`, falling back to the `Node` arm, and hands the arm the node's
 * home.
 *
 * It renders no element of its own; the arm renders the root, an `<li>`.
 *
 * `import { EntityRow } from "@canonical/prism-projections";`
 */
export default function EntityRow({
  node,
  ...props
}: EntityRowProps): ReactElement {
  const data = useFragment(entityRowFragmentNode, node);
  const map = useProjectionMaps().row;
  const href = useHome({
    __typename: data.__typename,
    uri: data._meta.curie,
  });
  const Arm = map[data.__typename] ?? map.Node;
  return <Arm {...props} href={href} node={data} />;
}
