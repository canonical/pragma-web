// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/ChipProjection_node.graphql.js";
import { OntologyClassChip } from "../../ontology/index.js";
import useSiteSwitch from "../../projections/hooks/useSiteSwitch.js";
import { requireArmKey } from "../../utils/index.js";
import { NodeChip } from "../NodeChip/index.js";
import type { ChipProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ChipProjection reads from the Node it dispatches: its typename,
 * and each arm's fragment, spread aliased by the type the arm projects, `Node`
 * for every type no other arm takes, and the site slot, which
 * the site's switch reads: `SiteChipSlot_node` spread aliased as `Site`.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ChipProjection_node on Node {
    __typename
    ...NodeChip_node @alias(as: "Node")
    ...SiteChipSlot_node @alias(as: "Site")
    ...OntologyClassChip_node @alias(as: "OntologyClass")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the inline mention, dispatched on its type by an
 * explicit switch: an ontology class renders through its own arm,
 * `OntologyClassChip`, the cases being `ONTOLOGY_TYPES`; any other type through the `Node` arm, `NodeChip`. A site that gives its switches to
 * `ProjectionLinkProvider` takes every node instead: it renders through the
 * site's chip switch, over the site slot's key, the site's own compile of
 * `SiteChipSlot_node`. `linked={false}` reaches every arm, which then
 * neither links nor peeks.
 *
 * It renders no element of its own: the arm renders the root, a `<span>`, and
 * every native prop reaches it.
 *
 * `import { ChipProjection } from "@canonical/prism-projections";`
 *
 * @implements prism.component.chip_projection
 * @note Impure: reads its node from the Relay store and the site's switch from
 *   the projection provider.
 */
export default function ChipProjection({
  node,
  ...props
}: ChipProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const Site = useSiteSwitch("chip");
  if (Site !== undefined) return <Site {...props} node={data.Site} />;
  switch (data.__typename) {
    case "OntologyClass":
      return (
        <OntologyClassChip
          {...props}
          node={requireArmKey(data.OntologyClass, data.__typename)}
        />
      );
    default:
      return <NodeChip {...props} node={data.Node} />;
  }
}
