// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  NodeChip,
  OntologyClassChip,
  requireArmKey,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import {
  CarTypeChip,
  FormationChip,
  RollingStockChip,
  UnitChip,
} from "#domains/fleet";
import {
  InterchangeChip,
  LineChip,
  StationChip,
  ZoneChip,
} from "#domains/metro";
import nodeFragment from "#relay/__generated__/MetroChipProjection_node.graphql.js";
import type { MetroChipProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields MetroChipProjection reads from the Node it dispatches: its
 * typename; the package's `Node` arm, spread aliased as `Node`, for every
 * type no other arm takes; and the arm of each metro type and of the
 * ontology class, aliased by the type it is on. It spreads the package's
 * arms, not its switch: the package's switch reaches this one through
 * the site slot, so spreading it here would make a fragment cycle.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment MetroChipProjection_node on Node {
    __typename
    ...NodeChip_node @alias(as: "Node")
    ...OntologyClassChip_node @alias(as: "OntologyClass")
    ...StationChip_node @alias(as: "Station")
    ...InterchangeChip_node @alias(as: "Interchange")
    ...LineChip_node @alias(as: "Line")
    ...ZoneChip_node @alias(as: "Zone")
    ...RollingStockChip_node @alias(as: "RollingStock")
    ...FormationChip_node @alias(as: "Formation")
    ...UnitChip_node @alias(as: "Unit")
    ...CarTypeChip_node @alias(as: "CarType")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the inline mention on this site, dispatched on its type by an
 * explicit switch, the cases being `METRO_CHIP_TYPES`: a station, an
 * interchange, a line, a fare zone, a rolling stock, a formation, a unit or
 * a car type renders through its own arm; an ontology
 * class through the package's class arm; every other node through the
 * package's `Node` arm, `NodeChip`.
 *
 * It renders no element of its own: the arm renders the root, a `<span>`,
 * and every native prop reaches it.
 *
 * `import { MetroChipProjection } from "#lib/ui";`
 *
 * @implements metro.component.metro_chip_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function MetroChipProjection({
  node,
  ...props
}: MetroChipProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  switch (data.__typename) {
    case "Station":
      return (
        <StationChip
          {...props}
          node={requireArmKey(data.Station, data.__typename)}
        />
      );
    case "Interchange":
      return (
        <InterchangeChip
          {...props}
          node={requireArmKey(data.Interchange, data.__typename)}
        />
      );
    case "Line":
      return (
        <LineChip {...props} node={requireArmKey(data.Line, data.__typename)} />
      );
    case "Zone":
      return (
        <ZoneChip {...props} node={requireArmKey(data.Zone, data.__typename)} />
      );
    case "RollingStock":
      return (
        <RollingStockChip
          {...props}
          node={requireArmKey(data.RollingStock, data.__typename)}
        />
      );
    case "Formation":
      return (
        <FormationChip
          {...props}
          node={requireArmKey(data.Formation, data.__typename)}
        />
      );
    case "Unit":
      return (
        <UnitChip {...props} node={requireArmKey(data.Unit, data.__typename)} />
      );
    case "CarType":
      return (
        <CarTypeChip
          {...props}
          node={requireArmKey(data.CarType, data.__typename)}
        />
      );
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
