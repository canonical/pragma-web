import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import entityCommandFragmentNode from "../../__generated__/EntityCommand_node.graphql.js";
import { useProjectionMaps } from "../projections/index.js";
import type { EntityCommandProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The command's composite fragment: what dispatch reads, plus one spread per
 * arm in the command map. A type's own arm is spread inside an inline fragment
 * on that type, so the arm reads its own fields wherever the command renders.
 */
const entityCommandFragmentSource = (): unknown => graphql`
  fragment EntityCommand_node on Node {
    __typename
    _meta {
      curie
    }
    ...NodeCommand_node
  }
`;
void entityCommandFragmentSource;
/* v8 ignore stop */

/**
 * The command-palette entry: a node offered as a destination to jump to. It renders the node through the command map's arm for the node's
 * `__typename`, falling back to the `Node` arm, and hands the arm the node's
 * home.
 *
 * It renders no element of its own; the arm renders the root, an `<li>`.
 *
 * `import { EntityCommand } from "@canonical/prism-projections";`
 */
export default function EntityCommand({
  node,
  ...props
}: EntityCommandProps): ReactElement {
  const data = useFragment(entityCommandFragmentNode, node);
  const map = useProjectionMaps().command;
  const href = useHome({
    __typename: data.__typename,
    uri: data._meta.curie,
  });
  const Arm = map[data.__typename] ?? map.Node;
  return <Arm {...props} href={href} node={data} />;
}
