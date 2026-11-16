// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/GraphNodeProjection_node.graphql.js";
import { OntologyClassGraphNode } from "../../ontology/index.js";
import useSiteSwitch from "../../projections/hooks/useSiteSwitch.js";
import { requireArmKey } from "../../utils/index.js";
import { NodeGraphNode } from "../NodeGraphNode/index.js";
import type { GraphNodeProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields GraphNodeProjection reads from the Node it dispatches: its
 * typename, and each arm's fragment, spread aliased by the type the arm
 * projects, `Node` for every type no other arm takes, and the site slot, which
 * the site's switch reads: `SiteGraphNodeSlot_node` spread aliased
 * as `Site`.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment GraphNodeProjection_node on Node {
    __typename
    ...NodeGraphNode_node @alias(as: "Node")
    ...SiteGraphNodeSlot_node @alias(as: "Site")
    ...OntologyClassGraphNode_node @alias(as: "OntologyClass")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the node of a graph, dispatched on its type by an explicit switch: an ontology class renders
 * through its own arm, `OntologyClassGraphNode`, the cases being
 * `ONTOLOGY_TYPES`; any other type through the `Node` arm, `NodeGraphNode`. A site that gives its switches to
 * `ProjectionLinkProvider` takes every node instead: it renders through the
 * site's graph-node switch, over the site slot's key, the site's own compile of
 * `SiteGraphNodeSlot_node`.
 *
 * It renders no element of its own: the arm renders the root, an SVG
 * `<g>`, and every native prop reaches it, the graph's transform and the
 * width its layout gives the node among them.
 *
 * `import { GraphNodeProjection } from "@canonical/prism-projections";`
 *
 * @implements prism.component.graph_node_projection
 * @note Impure: reads its node from the Relay store and the site's switch from
 *   the projection provider.
 */
export default function GraphNodeProjection({
  node,
  ...props
}: GraphNodeProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const Site = useSiteSwitch("graphNode");
  if (Site !== undefined) return <Site {...props} node={data.Site} />;
  switch (data.__typename) {
    case "OntologyClass":
      return (
        <OntologyClassGraphNode
          {...props}
          node={requireArmKey(data.OntologyClass, data.__typename)}
        />
      );
    default:
      return <NodeGraphNode {...props} node={data.Node} />;
  }
}
