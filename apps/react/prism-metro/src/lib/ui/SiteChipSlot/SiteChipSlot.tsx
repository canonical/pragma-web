// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/SiteChipSlot_node.graphql.js";
import { MetroChipProjection } from "../MetroChipProjection/index.js";
import type { SiteChipSlotProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The site slot of the package's chip switch, which the app's Relay
 * compile takes in place of the package's default: the site's own chip
 * switch's fragment.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteChipSlot_node on Node {
    ...MetroChipProjection_node
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * The site's chip switch as the package's chip switch reaches it: the
 * Shell gives it to `ProjectionLinkProvider`, and it hands the node to
 * `MetroChipProjection`, so a lens query that spreads the package's switch
 * renders a metro node through the metro's arm.
 *
 * It renders no element of its own: the arm renders the root, a `<span>`,
 * and every native prop reaches it.
 *
 * `import { SiteChipSlot } from "#lib/ui";`
 *
 * @implements metro.component.site_chip_slot
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteChipSlot({
  node,
  ...props
}: SiteChipSlotProps): ReactElement {
  return (
    <MetroChipProjection {...props} node={useFragment(nodeFragment, node)} />
  );
}
