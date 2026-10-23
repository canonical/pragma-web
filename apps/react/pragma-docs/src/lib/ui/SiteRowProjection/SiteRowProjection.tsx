// Scaffolded by @canonical/summon-component:react v0.43.0

import { renderArm } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../relay/__generated__/SiteRowProjection_node.graphql.js";
import { siteProjectionMaps } from "../constants.js";
import type { SiteRowProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields SiteRowProjection reads from the Node it dispatches: its
 * typename; the package's row composite, spread aliased as `Node`, for every
 * type the site does not project itself; and the projection of each design-
 * system type, aliased by the type it is on. The three UI-block types share
 * one projection, each narrowed by an inline fragment, so each alias holds a
 * key for its own type alone.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteRowProjection_node on Node {
    __typename
    ...RowProjection_node @alias(as: "Node")
    ... on Component @alias(as: "Component") {
      ...UIBlockRow_node
    }
    ... on Pattern @alias(as: "Pattern") {
      ...UIBlockRow_node
    }
    ... on Layout @alias(as: "Layout") {
      ...UIBlockRow_node
    }
    ...ModifierRow_node @alias(as: "Modifier")
    ...ModifierFamilyRow_node @alias(as: "ModifierFamily")
    ...CodeStandardRow_node @alias(as: "CodeStandard")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the 32px list entry on this site, dispatched on its
 * type: a component, a pattern or a layout renders through `UIBlockRow`,
 * a modifier through `ModifierRow`, a modifier family through
 * `ModifierFamilyRow` and a code standard through `CodeStandardRow`;
 * every other node through the package's `RowProjection`, which
 * renders an ontology class through its own arm and any other node
 * through the arm the site's provided maps hold for it.
 *
 * It renders no element of its own: the arm renders the root,
 * an `<li>`, and every native prop reaches it.
 *
 * `import { SiteRowProjection } from "#lib/ui";`
 *
 * @implements docs.component.site_row_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteRowProjection({
  node,
  ...props
}: SiteRowProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  return renderArm(siteProjectionMaps.row, data, props);
}
