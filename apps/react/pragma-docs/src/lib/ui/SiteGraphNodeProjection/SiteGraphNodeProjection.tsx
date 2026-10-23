// Scaffolded by @canonical/summon-component:react v0.43.0

import { renderArm } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../relay/__generated__/SiteGraphNodeProjection_node.graphql.js";
import { siteProjectionMaps } from "../constants.js";
import type { SiteGraphNodeProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields SiteGraphNodeProjection reads from the Node it dispatches: its
 * typename; the package's graph-node composite, spread aliased as `Node`,
 * for every type the site does not project itself; and the projection of
 * each design-system type, aliased by the type it is on. The three UI-block
 * types share one projection, each narrowed by an inline fragment, so each
 * alias holds a key for its own type alone.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteGraphNodeProjection_node on Node {
    __typename
    ...GraphNodeProjection_node @alias(as: "Node")
    ... on Component @alias(as: "Component") {
      ...UIBlockGraphNode_node
    }
    ... on Pattern @alias(as: "Pattern") {
      ...UIBlockGraphNode_node
    }
    ... on Layout @alias(as: "Layout") {
      ...UIBlockGraphNode_node
    }
    ...ModifierGraphNode_node @alias(as: "Modifier")
    ...ModifierFamilyGraphNode_node @alias(as: "ModifierFamily")
    ...CodeStandardGraphNode_node @alias(as: "CodeStandard")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the node of a graph on this site, dispatched on its type: a
 * component, a pattern or a layout renders through `UIBlockGraphNode`, a
 * modifier through `ModifierGraphNode`, a modifier family through
 * `ModifierFamilyGraphNode` and a code standard through `CodeStandardGraphNode`;
 * every other node through the package's `GraphNodeProjection`, which renders
 * an ontology class through its own arm and any other node through the arm the
 * site's provided maps hold for it.
 *
 * It renders no element of its own: the arm renders the root, an SVG `<g>`, and
 * every native prop reaches it.
 *
 * `import { SiteGraphNodeProjection } from "#lib/ui";`
 *
 * @implements docs.component.site_graph_node_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteGraphNodeProjection({
  node,
  ...props
}: SiteGraphNodeProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  return renderArm(siteProjectionMaps.graphNode, data, props);
}
