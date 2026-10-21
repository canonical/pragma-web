import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import entityChipFragmentNode from "../../__generated__/EntityChip_node.graphql.js";
import { useProjectionMaps } from "../projections/index.js";
import type { EntityChipProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The chip's composite fragment: what dispatch reads, plus the `Node`
 * arm's fragment, spread at the top level because `Node` is the one arm
 * the chip map holds.
 */
const entityChipFragmentSource = (): unknown => graphql`
  fragment EntityChip_node on Node {
    __typename
    _meta {
      curie
    }
    ...NodeChip_node
  }
`;
void entityChipFragmentSource;
/* v8 ignore stop */

/**
 * The inline mention of a graph node: it renders the node through the chip
 * map's arm for the node's `__typename`, falling back to the `Node` arm, and
 * hands the arm the node's home.
 *
 * It renders no element of its own; the arm renders the root, a `<span>`.
 *
 * `import { EntityChip } from "@canonical/prism-projections";`
 */
export default function EntityChip({
  node,
  children,
  ...props
}: EntityChipProps): ReactElement {
  const data = useFragment(entityChipFragmentNode, node);
  const map = useProjectionMaps().chip;
  const href = useHome({
    __typename: data.__typename,
    uri: data._meta.curie,
  });
  const Arm = map[data.__typename] ?? map.Node;
  return (
    <Arm {...props} href={href} node={data}>
      {children}
    </Arm>
  );
}
