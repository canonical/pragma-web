// Scaffolded by @canonical/summon-component:react v0.43.0

import { RowProjection, requireArmKey } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import {
  CarTypeRow,
  FormationRow,
  RollingStockRow,
  UnitRow,
} from "#domains/fleet";
import { InterchangeRow, LineRow, StationRow, ZoneRow } from "#domains/metro";
import nodeFragment from "#relay/__generated__/MetroRowProjection_node.graphql.js";
import type { MetroRowProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields MetroRowProjection reads from the Node it dispatches: its
 * typename; the package's row switch, spread aliased as `Node`, for
 * every type the site does not project itself; and the arm of each metro
 * type, aliased by the type it is on.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment MetroRowProjection_node on Node {
    __typename
    ...RowProjection_node @alias(as: "Node")
    ...StationRow_node @alias(as: "Station")
    ...InterchangeRow_node @alias(as: "Interchange")
    ...LineRow_node @alias(as: "Line")
    ...ZoneRow_node @alias(as: "Zone")
    ...RollingStockRow_node @alias(as: "RollingStock")
    ...FormationRow_node @alias(as: "Formation")
    ...UnitRow_node @alias(as: "Unit")
    ...CarTypeRow_node @alias(as: "CarType")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the 32px list entry on this site, dispatched on its type by an
 * explicit switch, the cases being `METRO_ROW_TYPES`: a station, an
 * interchange, a line, a fare zone, a rolling stock, a formation, a unit or
 * a car type renders through its own arm; every other node through the
 * package's `RowProjection`, which renders an ontology class through its
 * own arm and any other node through its `Node` arm.
 *
 * It renders no element of its own: the arm renders the root, an `<li>`,
 * and every native prop reaches it.
 *
 * `import { MetroRowProjection } from "#lib/ui";`
 *
 * @implements metro.component.metro_row_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function MetroRowProjection({
  node,
  ...props
}: MetroRowProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  switch (data.__typename) {
    case "Station":
      return (
        <StationRow
          {...props}
          node={requireArmKey(data.Station, data.__typename)}
        />
      );
    case "Interchange":
      return (
        <InterchangeRow
          {...props}
          node={requireArmKey(data.Interchange, data.__typename)}
        />
      );
    case "Line":
      return (
        <LineRow {...props} node={requireArmKey(data.Line, data.__typename)} />
      );
    case "Zone":
      return (
        <ZoneRow {...props} node={requireArmKey(data.Zone, data.__typename)} />
      );
    case "RollingStock":
      return (
        <RollingStockRow
          {...props}
          node={requireArmKey(data.RollingStock, data.__typename)}
        />
      );
    case "Formation":
      return (
        <FormationRow
          {...props}
          node={requireArmKey(data.Formation, data.__typename)}
        />
      );
    case "Unit":
      return (
        <UnitRow {...props} node={requireArmKey(data.Unit, data.__typename)} />
      );
    case "CarType":
      return (
        <CarTypeRow
          {...props}
          node={requireArmKey(data.CarType, data.__typename)}
        />
      );
    default:
      return <RowProjection {...props} node={data.Node} />;
  }
}
