import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import commandProjectionFragmentNode from "../../__generated__/CommandProjection_node.graphql.js";
import { useProjectionMaps } from "../projections/index.js";
import type { CommandProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The command's composite fragment: what dispatch reads, plus the `Node`
 * arm's fragment, spread at the top level because `Node` is the one arm
 * the command map holds.
 */
const commandProjectionFragmentSource = (): unknown => graphql`
  fragment CommandProjection_node on Node {
    __typename
    _meta {
      curie
    }
    ...NodeCommand_node
  }
`;
void commandProjectionFragmentSource;
/* v8 ignore stop */

/**
 * The command-palette entry: a node offered as a destination to jump to. It
 * renders the node through the command map's arm for the node's `__typename`,
 * falling back to the `Node` arm, and hands the arm the node's home.
 *
 * It renders no element of its own; the arm renders the root, an `<li>`.
 *
 * `import { CommandProjection } from "@canonical/prism-projections";`
 */
export default function CommandProjection({
  node,
  ...props
}: CommandProjectionProps): ReactElement {
  const data = useFragment(commandProjectionFragmentNode, node);
  const map = useProjectionMaps().command;
  const href = useHome({
    __typename: data.__typename,
    uri: data._meta.curie,
  });
  const Arm = map[data.__typename] ?? map.Node;
  return <Arm {...props} href={href} node={data} />;
}
