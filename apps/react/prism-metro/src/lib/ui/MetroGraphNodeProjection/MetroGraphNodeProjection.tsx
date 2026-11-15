// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  GraphNodeProjection,
  requireArmKey,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import {
  CarTypeGraphNode,
  FormationGraphNode,
  RollingStockGraphNode,
  UnitGraphNode,
} from "#domains/fleet";
import {
  InterchangeGraphNode,
  LineGraphNode,
  StationGraphNode,
  ZoneGraphNode,
} from "#domains/metro";
import nodeFragment from "#relay/__generated__/MetroGraphNodeProjection_node.graphql.js";
import type { MetroGraphNodeProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields MetroGraphNodeProjection reads from the Node it dispatches: its
 * typename; the package's graph node switch, spread aliased as `Node`, for
 * every type the site does not project itself; and the arm of each metro
 * type, aliased by the type it is on.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment MetroGraphNodeProjection_node on Node {
    __typename
    ...GraphNodeProjection_node @alias(as: "Node")
    ...StationGraphNode_node @alias(as: "Station")
    ...InterchangeGraphNode_node @alias(as: "Interchange")
    ...LineGraphNode_node @alias(as: "Line")
    ...ZoneGraphNode_node @alias(as: "Zone")
    ...RollingStockGraphNode_node @alias(as: "RollingStock")
    ...FormationGraphNode_node @alias(as: "Formation")
    ...UnitGraphNode_node @alias(as: "Unit")
    ...CarTypeGraphNode_node @alias(as: "CarType")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as a node of a graph on this site, dispatched on its type by an
 * explicit switch, the cases being `METRO_GRAPH_NODE_TYPES`: a station, an
 * interchange, a line, a fare zone, a rolling stock, a formation, a unit or
 * a car type renders through its own arm; every other node through the
 * package's `GraphNodeProjection`, which renders an ontology class through its
 * own arm and any other node through its `Node` arm.
 *
 * It renders no element of its own: the arm renders the root, a `<g>`,
 * and every native prop reaches it.
 *
 * `import { MetroGraphNodeProjection } from "#lib/ui";`
 *
 * @implements metro.component.metro_graph_node_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function MetroGraphNodeProjection({
  node,
  ...props
}: MetroGraphNodeProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  switch (data.__typename) {
    case "Station":
      return (
        <StationGraphNode
          {...props}
          node={requireArmKey(data.Station, data.__typename)}
        />
      );
    case "Interchange":
      return (
        <InterchangeGraphNode
          {...props}
          node={requireArmKey(data.Interchange, data.__typename)}
        />
      );
    case "Line":
      return (
        <LineGraphNode
          {...props}
          node={requireArmKey(data.Line, data.__typename)}
        />
      );
    case "Zone":
      return (
        <ZoneGraphNode
          {...props}
          node={requireArmKey(data.Zone, data.__typename)}
        />
      );
    case "RollingStock":
      return (
        <RollingStockGraphNode
          {...props}
          node={requireArmKey(data.RollingStock, data.__typename)}
        />
      );
    case "Formation":
      return (
        <FormationGraphNode
          {...props}
          node={requireArmKey(data.Formation, data.__typename)}
        />
      );
    case "Unit":
      return (
        <UnitGraphNode
          {...props}
          node={requireArmKey(data.Unit, data.__typename)}
        />
      );
    case "CarType":
      return (
        <CarTypeGraphNode
          {...props}
          node={requireArmKey(data.CarType, data.__typename)}
        />
      );
    default:
      return <GraphNodeProjection {...props} node={data.Node} />;
  }
}
