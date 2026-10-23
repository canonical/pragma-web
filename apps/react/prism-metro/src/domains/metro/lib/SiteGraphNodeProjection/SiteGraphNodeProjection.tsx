// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/SiteGraphNodeProjection_node.graphql.js";
import assertSiteKey from "../../assertSiteKey.js";
import { InterchangeGraphNode } from "../InterchangeGraphNode/index.js";
import { LineGraphNode } from "../LineGraphNode/index.js";
import { StationGraphNode } from "../StationGraphNode/index.js";
import { ZoneGraphNode } from "../ZoneGraphNode/index.js";
import type { SiteGraphNodeProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The site slot of the package's graph node dispatcher, which the app's Relay
 * compile takes in place of the package's default: the typename, and each metro
 * graph node arm's fragment spread aliased by the type it projects.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteGraphNodeProjection_node on Node {
    __typename
    ...StationGraphNode_node @alias(as: "Station")
    ...InterchangeGraphNode_node @alias(as: "Interchange")
    ...LineGraphNode_node @alias(as: "Line")
    ...ZoneGraphNode_node @alias(as: "Zone")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * A metro node as the node of a graph, dispatched on its type inside the
 * package's graph node dispatcher: the graph node map lists it under
 * `siteTypes` for every metro type, and it renders the arm the node's typename
 * selects, over that type's aliased key: a station, an interchange, a line or a
 * fare zone.
 *
 * It renders no element of its own: the arm renders the root, an SVG `<g>`, and
 * every native prop reaches it.
 *
 * `import { SiteGraphNodeProjection } from "./lib/index.js";`
 *
 * @implements metro.component.site_graph_node_projection
 * @throws When the typename is not a metro type, or the store holds no
 *   data under that type's spread.
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteGraphNodeProjection({
  node,
  typename,
  ...props
}: SiteGraphNodeProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  switch (typename) {
    case "Station":
      return (
        <StationGraphNode
          {...props}
          node={assertSiteKey(data.Station, typename)}
        />
      );
    case "Interchange":
      return (
        <InterchangeGraphNode
          {...props}
          node={assertSiteKey(data.Interchange, typename)}
        />
      );
    case "Line":
      return (
        <LineGraphNode {...props} node={assertSiteKey(data.Line, typename)} />
      );
    case "Zone":
      return (
        <ZoneGraphNode {...props} node={assertSiteKey(data.Zone, typename)} />
      );
    default:
      throw new Error(
        `SiteGraphNodeProjection: the graph node map arms no metro type named ${typename}`,
      );
  }
}
