// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/GraphNodeProjection_node.graphql.js";
import { useProjectionMaps } from "../../projections/index.js";
import renderArm from "../../projections/renderArm.js";
import type { GraphNodeProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields GraphNodeProjection reads from the Node it dispatches: its
 * typename, and each arm's fragment, spread aliased by the type the arm
 * projects, `Node` for every type no other arm takes.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment GraphNodeProjection_node on Node {
    __typename
    ...NodeGraphNode_node @alias(as: "Node")
    ...OntologyClassGraphNode_node @alias(as: "OntologyClass")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the node of a graph, dispatched on its type: it renders
 * the arm the site's graph-node map holds for the node's typename, or the
 * `Node` arm, `NodeGraphNode`, for every type no other arm takes. A site's
 * arm for a type of its own renders over the `Node` arm's key.
 *
 * It renders no element of its own: the arm renders the root, an SVG
 * `<g>`, and every native prop reaches it, the graph's transform and the
 * width its layout gives the node among them.
 *
 * `import { GraphNodeProjection } from "@canonical/prism-projections";`
 *
 * @implements prism.component.graph_node_projection
 * @note Impure: reads its node from the Relay store and its arms from the
 *   projection provider.
 */
export default function GraphNodeProjection({
  node,
  ...props
}: GraphNodeProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  return renderArm(useProjectionMaps().graphNode, data, props);
}
