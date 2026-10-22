import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import entityCardFragmentNode from "../../__generated__/EntityCard_node.graphql.js";
import { useProjectionMaps } from "../projections/index.js";
import type { EntityCardProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The card's composite fragment: what dispatch reads, plus the `Node`
 * arm's fragment, spread at the top level because `Node` is the one arm
 * the card map holds.
 */
const entityCardFragmentSource = (): unknown => graphql`
  fragment EntityCard_node on Node {
    __typename
    _meta {
      curie
    }
    ...NodeCard_node
  }
`;
void entityCardFragmentSource;
/* v8 ignore stop */

/**
 * The card: a node as a self-contained tile in a grid of entities. It renders
 * the node through the card map's arm for the node's `__typename`, falling
 * back to the `Node` arm, and hands the arm the node's home.
 *
 * It renders no element of its own; the arm renders the root, an `<article>`.
 *
 * `import { EntityCard } from "@canonical/prism-projections";`
 */
export default function EntityCard({
  node,
  ...props
}: EntityCardProps): ReactElement {
  const data = useFragment(entityCardFragmentNode, node);
  const map = useProjectionMaps().card;
  const href = useHome({
    __typename: data.__typename,
    uri: data._meta.curie,
  });
  const Arm = map[data.__typename] ?? map.Node;
  return <Arm {...props} href={href} node={data} />;
}
