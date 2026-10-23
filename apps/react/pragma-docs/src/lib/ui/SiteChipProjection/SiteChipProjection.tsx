// Scaffolded by @canonical/summon-component:react v0.43.0

import { renderArm } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../relay/__generated__/SiteChipProjection_node.graphql.js";
import { siteProjectionMaps } from "../constants.js";
import type { SiteChipProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields SiteChipProjection reads from the Node it dispatches: its
 * typename; the package's chip composite, spread aliased as `Node`, for
 * every type the site does not project itself; and the projection of each
 * design-system type, aliased by the type it is on. The three UI-block types
 * share one projection, each narrowed by an inline fragment, so each alias
 * holds a key for its own type alone.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteChipProjection_node on Node {
    __typename
    ...ChipProjection_node @alias(as: "Node")
    ... on Component @alias(as: "Component") {
      ...UIBlockChip_node
    }
    ... on Pattern @alias(as: "Pattern") {
      ...UIBlockChip_node
    }
    ... on Layout @alias(as: "Layout") {
      ...UIBlockChip_node
    }
    ...ModifierChip_node @alias(as: "Modifier")
    ...ModifierFamilyChip_node @alias(as: "ModifierFamily")
    ...CodeStandardChip_node @alias(as: "CodeStandard")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the inline mention on this site, dispatched on its
 * type: a component, a pattern or a layout renders through `UIBlockChip`,
 * a modifier through `ModifierChip`, a modifier family through
 * `ModifierFamilyChip` and a code standard through `CodeStandardChip`;
 * every other node through the package's `ChipProjection`, which
 * renders an ontology class through its own arm and any other node
 * through the arm the site's provided maps hold for it.
 *
 * It renders no element of its own: the arm renders the root,
 * a `<span>`, and every native prop reaches it.
 *
 * `import { SiteChipProjection } from "#lib/ui";`
 *
 * @implements docs.component.site_chip_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteChipProjection({
  node,
  ...props
}: SiteChipProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  return renderArm(siteProjectionMaps.chip, data, props);
}
