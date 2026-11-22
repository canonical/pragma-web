// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/SiteRowSlot_node.graphql.js";
import { DocsRowProjection } from "../DocsRowProjection/index.js";
import type { SiteRowSlotProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The site slot of the package's row switch, which the app's Relay
 * compile takes in place of the package's default: the site's own row
 * switch's fragment.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteRowSlot_node on Node {
    ...DocsRowProjection_node
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * The site's row switch as the package's row switch reaches it: the
 * Shell gives it to `ProjectionLinkProvider`, and it hands the node to
 * `DocsRowProjection`, so a lens query that spreads the package's switch
 * renders a docs node through the site's arm.
 *
 * It renders no element of its own: the arm renders the root, a `<li>`,
 * and every native prop reaches it.
 *
 * `import { SiteRowSlot } from "#lib/ui";`
 *
 * @implements docs.component.site_row_slot
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteRowSlot({
  node,
  ...props
}: SiteRowSlotProps): ReactElement {
  return (
    <DocsRowProjection {...props} node={useFragment(nodeFragment, node)} />
  );
}
