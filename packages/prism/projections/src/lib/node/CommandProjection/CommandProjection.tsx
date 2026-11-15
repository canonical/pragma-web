// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/CommandProjection_node.graphql.js";
import { OntologyClassCommand } from "../../ontology/index.js";
import useSiteSwitch from "../../projections/hooks/useSiteSwitch.js";
import { requireArmKey } from "../../utils/index.js";
import { NodeCommand } from "../NodeCommand/index.js";
import type { CommandProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CommandProjection reads from the Node it dispatches: its typename,
 * and each arm's fragment, spread aliased by the type the arm projects, `Node`
 * for every type no other arm takes, and the site slot, which
 * the site's switch reads: `SiteCommandSlot_node` spread aliased as `Site`.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CommandProjection_node on Node {
    __typename
    ...NodeCommand_node @alias(as: "Node")
    ...SiteCommandSlot_node @alias(as: "Site")
    ...OntologyClassCommand_node @alias(as: "OntologyClass")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the 56px command-palette result, dispatched on its type by an explicit switch: an ontology class renders
 * through its own arm, `OntologyClassCommand`, the cases being
 * `ONTOLOGY_TYPES`; any other type through the `Node` arm, `NodeCommand`. A site that gives its switches to
 * `ProjectionLinkProvider` takes every node instead: it renders through the
 * site's command switch, over the site slot's key, the site's own compile of
 * `SiteCommandSlot_node`.
 *
 * It renders no element of its own: the arm renders the root, an `<li>`, and
 * every native prop reaches it.
 *
 * `import { CommandProjection } from "@canonical/prism-projections";`
 *
 * @implements prism.component.command_projection
 * @note Impure: reads its node from the Relay store and the site's switch from
 *   the projection provider.
 */
export default function CommandProjection({
  node,
  ...props
}: CommandProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const Site = useSiteSwitch("command");
  if (Site !== undefined) return <Site {...props} node={data.Site} />;
  switch (data.__typename) {
    case "OntologyClass":
      return (
        <OntologyClassCommand
          {...props}
          node={requireArmKey(data.OntologyClass, data.__typename)}
        />
      );
    default:
      return <NodeCommand {...props} node={data.Node} />;
  }
}
