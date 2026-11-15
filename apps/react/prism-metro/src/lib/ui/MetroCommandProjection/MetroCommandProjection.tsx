// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  NodeCommand,
  OntologyClassCommand,
  requireArmKey,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import {
  CarTypeCommand,
  FormationCommand,
  RollingStockCommand,
  UnitCommand,
} from "#domains/fleet";
import {
  InterchangeCommand,
  LineCommand,
  StationCommand,
  ZoneCommand,
} from "#domains/metro";
import nodeFragment from "#relay/__generated__/MetroCommandProjection_node.graphql.js";
import type { MetroCommandProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields MetroCommandProjection reads from the Node it dispatches: its
 * typename; the package's `Node` arm, spread aliased as `Node`, for every
 * type no other arm takes; and the arm of each metro type and of the
 * ontology class, aliased by the type it is on. It spreads the package's
 * arms, not its switch: the package's switch reaches this one through
 * the site slot, so spreading it here would make a fragment cycle.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment MetroCommandProjection_node on Node {
    __typename
    ...NodeCommand_node @alias(as: "Node")
    ...OntologyClassCommand_node @alias(as: "OntologyClass")
    ...StationCommand_node @alias(as: "Station")
    ...InterchangeCommand_node @alias(as: "Interchange")
    ...LineCommand_node @alias(as: "Line")
    ...ZoneCommand_node @alias(as: "Zone")
    ...RollingStockCommand_node @alias(as: "RollingStock")
    ...FormationCommand_node @alias(as: "Formation")
    ...UnitCommand_node @alias(as: "Unit")
    ...CarTypeCommand_node @alias(as: "CarType")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the command-palette entry on this site, dispatched on its type by an
 * explicit switch, the cases being `METRO_COMMAND_TYPES`: a station, an
 * interchange, a line, a fare zone, a rolling stock, a formation, a unit or
 * a car type renders through its own arm; an ontology
 * class through the package's class arm; every other node through the
 * package's `Node` arm, `NodeCommand`.
 *
 * It renders no element of its own: the arm renders the root, an `<li>`,
 * and every native prop reaches it.
 *
 * `import { MetroCommandProjection } from "#lib/ui";`
 *
 * @implements metro.component.metro_command_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function MetroCommandProjection({
  node,
  ...props
}: MetroCommandProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  switch (data.__typename) {
    case "Station":
      return (
        <StationCommand
          {...props}
          node={requireArmKey(data.Station, data.__typename)}
        />
      );
    case "Interchange":
      return (
        <InterchangeCommand
          {...props}
          node={requireArmKey(data.Interchange, data.__typename)}
        />
      );
    case "Line":
      return (
        <LineCommand
          {...props}
          node={requireArmKey(data.Line, data.__typename)}
        />
      );
    case "Zone":
      return (
        <ZoneCommand
          {...props}
          node={requireArmKey(data.Zone, data.__typename)}
        />
      );
    case "RollingStock":
      return (
        <RollingStockCommand
          {...props}
          node={requireArmKey(data.RollingStock, data.__typename)}
        />
      );
    case "Formation":
      return (
        <FormationCommand
          {...props}
          node={requireArmKey(data.Formation, data.__typename)}
        />
      );
    case "Unit":
      return (
        <UnitCommand
          {...props}
          node={requireArmKey(data.Unit, data.__typename)}
        />
      );
    case "CarType":
      return (
        <CarTypeCommand
          {...props}
          node={requireArmKey(data.CarType, data.__typename)}
        />
      );
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
