// Scaffolded by @canonical/summon-component:react v0.43.0

import { renderArm } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../relay/__generated__/SiteCardProjection_node.graphql.js";
import { siteProjectionMaps } from "../constants.js";
import type { SiteCardProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields SiteCardProjection reads from the Node it dispatches: its
 * typename; the package's card composite, spread aliased as `Node`, for
 * every type the site does not project itself; and the projection of each
 * design-system type, aliased by the type it is on. The three UI-block types
 * share one projection, each narrowed by an inline fragment, so each alias
 * holds a key for its own type alone.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteCardProjection_node on Node {
    __typename
    ...CardProjection_node @alias(as: "Node")
    ... on Component @alias(as: "Component") {
      ...UIBlockCard_node
    }
    ... on Pattern @alias(as: "Pattern") {
      ...UIBlockCard_node
    }
    ... on Layout @alias(as: "Layout") {
      ...UIBlockCard_node
    }
    ...ModifierCard_node @alias(as: "Modifier")
    ...ModifierFamilyCard_node @alias(as: "ModifierFamily")
    ...CodeStandardCard_node @alias(as: "CodeStandard")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the card in a grid of entities on this site, dispatched on
 * its type: a component, a pattern or a layout renders through `UIBlockCard`, a
 * modifier through `ModifierCard`, a modifier family through
 * `ModifierFamilyCard` and a code standard through `CodeStandardCard`;
 * every other node through the package's `CardProjection`, which renders an
 * ontology class through its own arm and any other node through the arm the
 * site's provided maps hold for it.
 *
 * It renders no element of its own: the arm renders the root, a `<div>`, and
 * every native prop reaches it.
 *
 * `import { SiteCardProjection } from "#lib/ui";`
 *
 * @implements docs.component.site_card_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteCardProjection({
  node,
  ...props
}: SiteCardProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  return renderArm(siteProjectionMaps.card, data, props);
}
