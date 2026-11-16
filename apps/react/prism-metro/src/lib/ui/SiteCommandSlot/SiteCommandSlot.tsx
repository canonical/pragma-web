// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/SiteCommandSlot_node.graphql.js";
import { MetroCommandProjection } from "../MetroCommandProjection/index.js";
import type { SiteCommandSlotProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The site slot of the package's command switch, which the app's Relay
 * compile takes in place of the package's default: the site's own command
 * switch's fragment.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteCommandSlot_node on Node {
    ...MetroCommandProjection_node
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * The site's command switch as the package's command switch reaches it: the
 * Shell gives it to `ProjectionLinkProvider`, and it hands the node to
 * `MetroCommandProjection`, so a lens query that spreads the package's switch
 * renders a metro node through the metro's arm.
 *
 * It renders no element of its own: the arm renders the root, a `<li>`,
 * and every native prop reaches it.
 *
 * `import { SiteCommandSlot } from "#lib/ui";`
 *
 * @implements metro.component.site_command_slot
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteCommandSlot({
  node,
  ...props
}: SiteCommandSlotProps): ReactElement {
  return (
    <MetroCommandProjection {...props} node={useFragment(nodeFragment, node)} />
  );
}
