// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/SiteGraphNodeSlot_node.graphql.js";
import { DocsGraphNodeProjection } from "../DocsGraphNodeProjection/index.js";
import type { SiteGraphNodeSlotProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The site slot of the package's graph node switch, which the app's Relay
 * compile takes in place of the package's default: the site's own graph node
 * switch's fragment.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteGraphNodeSlot_node on Node {
    ...DocsGraphNodeProjection_node
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * The site's graph node switch as the package's graph node switch reaches it: the
 * Shell gives it to `ProjectionLinkProvider`, and it hands the node to
 * `DocsGraphNodeProjection`, so a lens query that spreads the package's switch
 * renders a docs node through the site's arm.
 *
 * It renders no element of its own: the arm renders the root, a `<g>`,
 * and every native prop reaches it.
 *
 * `import { SiteGraphNodeSlot } from "#lib/ui";`
 *
 * @implements docs.component.site_graph_node_slot
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteGraphNodeSlot({
  node,
  ...props
}: SiteGraphNodeSlotProps): ReactElement {
  return (
    <DocsGraphNodeProjection
      {...props}
      node={useFragment(nodeFragment, node)}
    />
  );
}
