import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import cardProjectionFragmentNode from "../../__generated__/CardProjection_node.graphql.js";
import { useProjectionMaps } from "../projections/index.js";
import type { CardProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The card's composite fragment: what dispatch reads, plus the `Node`
 * arm's fragment, spread at the top level because `Node` is the one arm
 * the card map holds.
 */
const cardProjectionFragmentSource = (): unknown => graphql`
  fragment CardProjection_node on Node {
    __typename
    _meta {
      curie
    }
    ...NodeCard_node
  }
`;
void cardProjectionFragmentSource;
/* v8 ignore stop */

/**
 * The card: a node as a self-contained tile in a grid of entities. It renders
 * the node through the card map's arm for the node's `__typename`, falling
 * back to the `Node` arm, and hands the arm the node's home.
 *
 * It renders no element of its own; the arm renders the root, an `<article>`.
 *
 * `import { CardProjection } from "@canonical/prism-projections";`
 */
export default function CardProjection({
  node,
  ...props
}: CardProjectionProps): ReactElement {
  const data = useFragment(cardProjectionFragmentNode, node);
  const map = useProjectionMaps().card;
  const href = useHome({
    __typename: data.__typename,
    uri: data._meta.curie,
  });
  const Arm = map[data.__typename] ?? map.Node;
  return <Arm {...props} href={href} node={data} />;
}
