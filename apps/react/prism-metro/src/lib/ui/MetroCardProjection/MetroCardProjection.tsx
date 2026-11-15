// Scaffolded by @canonical/summon-component:react v0.43.0

import { CardProjection, requireArmKey } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import {
  CarTypeCard,
  FormationCard,
  RollingStockCard,
  UnitCard,
} from "#domains/fleet";
import {
  InterchangeCard,
  LineCard,
  StationCard,
  ZoneCard,
} from "#domains/metro";
import nodeFragment from "#relay/__generated__/MetroCardProjection_node.graphql.js";
import type { MetroCardProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields MetroCardProjection reads from the Node it dispatches: its
 * typename; the package's card switch, spread aliased as `Node`, for
 * every type the site does not project itself; and the arm of each metro
 * type, aliased by the type it is on.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment MetroCardProjection_node on Node {
    __typename
    ...CardProjection_node @alias(as: "Node")
    ...StationCard_node @alias(as: "Station")
    ...InterchangeCard_node @alias(as: "Interchange")
    ...LineCard_node @alias(as: "Line")
    ...ZoneCard_node @alias(as: "Zone")
    ...RollingStockCard_node @alias(as: "RollingStock")
    ...FormationCard_node @alias(as: "Formation")
    ...UnitCard_node @alias(as: "Unit")
    ...CarTypeCard_node @alias(as: "CarType")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the card on this site, dispatched on its type by an
 * explicit switch, the cases being `METRO_CARD_TYPES`: a station, an
 * interchange, a line, a fare zone, a rolling stock, a formation, a unit or
 * a car type renders through its own arm; every other node through the
 * package's `CardProjection`, which renders an ontology class through its
 * own arm and any other node through its `Node` arm.
 *
 * It renders no element of its own: the arm renders the root, a `<div>`,
 * and every native prop reaches it.
 *
 * `import { MetroCardProjection } from "#lib/ui";`
 *
 * @implements metro.component.metro_card_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function MetroCardProjection({
  node,
  ...props
}: MetroCardProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  switch (data.__typename) {
    case "Station":
      return (
        <StationCard
          {...props}
          node={requireArmKey(data.Station, data.__typename)}
        />
      );
    case "Interchange":
      return (
        <InterchangeCard
          {...props}
          node={requireArmKey(data.Interchange, data.__typename)}
        />
      );
    case "Line":
      return (
        <LineCard {...props} node={requireArmKey(data.Line, data.__typename)} />
      );
    case "Zone":
      return (
        <ZoneCard {...props} node={requireArmKey(data.Zone, data.__typename)} />
      );
    case "RollingStock":
      return (
        <RollingStockCard
          {...props}
          node={requireArmKey(data.RollingStock, data.__typename)}
        />
      );
    case "Formation":
      return (
        <FormationCard
          {...props}
          node={requireArmKey(data.Formation, data.__typename)}
        />
      );
    case "Unit":
      return (
        <UnitCard {...props} node={requireArmKey(data.Unit, data.__typename)} />
      );
    case "CarType":
      return (
        <CarTypeCard
          {...props}
          node={requireArmKey(data.CarType, data.__typename)}
        />
      );
    default:
      return <CardProjection {...props} node={data.Node} />;
  }
}
