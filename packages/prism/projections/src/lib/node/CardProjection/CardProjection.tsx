// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/CardProjection_node.graphql.js";
import { useProjectionMaps } from "../../projections/index.js";
import renderArm from "../../projections/renderArm.js";
import type { CardProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CardProjection reads from the Node it dispatches: its typename,
 * and each arm's fragment, spread aliased by the type the arm projects, `Node`
 * for every type no other arm takes, and the site slot, the arms of the site's
 * own types: `SiteCardSlot_node` spread aliased as `Site`.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CardProjection_node on Node {
    __typename
    ...NodeCard_node @alias(as: "Node")
    ...SiteCardSlot_node @alias(as: "Site")
    ...OntologyClassCard_node @alias(as: "OntologyClass")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the card in a grid of entities, dispatched on its type: it
 * renders the arm the site's card map holds for the node's typename, or the
 * `Node` arm, `NodeCard`, for every type no other arm takes. A site's arm for a
 * type of its own renders over the site slot's key, the site's own compile of
 * `SiteCardSlot_node`.
 *
 * It renders no element of its own: the arm renders the root, a `<div>`, and
 * every native prop reaches it.
 *
 * `import { CardProjection } from "@canonical/prism-projections";`
 *
 * @implements prism.component.card_projection
 * @note Impure: reads its node from the Relay store and its arms from the
 *   projection provider.
 */
export default function CardProjection({
  node,
  ...props
}: CardProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  return renderArm(useProjectionMaps().card, data, props);
}
