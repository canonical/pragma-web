// Scaffolded by @canonical/summon-component:react v0.43.0

import { ChipProjection, requireArmKey } from "@canonical/prism-projections";
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
 * typename; the package's chip switch, spread aliased as `Node`, for
 * every type the site does not project itself; and the arm of each metro
 * type, aliased by the type it is on.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment MetroChipProjection_node on Node {
    __typename
    ...ChipProjection_node @alias(as: "Node")
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
 * a car type renders through its own arm; every other node through the
 * package's `ChipProjection`, which renders an ontology class through its
 * own arm and any other node through its `Node` arm.
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
  // The arms not yet on the identity's slots take no `linked`: every arm
  // that is on them takes all the props.
  const { linked, ...native } = props;
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
        <ZoneChip
          {...native}
          node={requireArmKey(data.Zone, data.__typename)}
        />
      );
    case "RollingStock":
      return (
        <RollingStockChip
          {...native}
          node={requireArmKey(data.RollingStock, data.__typename)}
        />
      );
    case "Formation":
      return (
        <FormationChip
          {...native}
          node={requireArmKey(data.Formation, data.__typename)}
        />
      );
    case "Unit":
      return (
        <UnitChip
          {...native}
          node={requireArmKey(data.Unit, data.__typename)}
        />
      );
    case "CarType":
      return (
        <CarTypeChip
          {...native}
          node={requireArmKey(data.CarType, data.__typename)}
        />
      );
    default:
      return <ChipProjection {...props} node={data.Node} />;
  }
}
