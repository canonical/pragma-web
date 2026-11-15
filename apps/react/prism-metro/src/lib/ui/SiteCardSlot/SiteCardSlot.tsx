// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/SiteCardSlot_node.graphql.js";
import { MetroCardProjection } from "../MetroCardProjection/index.js";
import type { SiteCardSlotProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The site slot of the package's card switch, which the app's Relay
 * compile takes in place of the package's default: the site's own card
 * switch's fragment.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteCardSlot_node on Node {
    ...MetroCardProjection_node
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * The site's card switch as the package's card switch reaches it: the
 * Shell gives it to `ProjectionLinkProvider`, and it hands the node to
 * `MetroCardProjection`, so a lens query that spreads the package's switch
 * renders a metro node through the metro's arm.
 *
 * It renders no element of its own: the arm renders the root, a `<div>`,
 * and every native prop reaches it.
 *
 * `import { SiteCardSlot } from "#lib/ui";`
 *
 * @implements metro.component.site_card_slot
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteCardSlot({
  node,
  ...props
}: SiteCardSlotProps): ReactElement {
  return (
    <MetroCardProjection {...props} node={useFragment(nodeFragment, node)} />
  );
}
