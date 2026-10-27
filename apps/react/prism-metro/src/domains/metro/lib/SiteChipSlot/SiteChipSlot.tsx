// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import {
  CarTypeChip,
  FormationChip,
  RollingStockChip,
  UnitChip,
} from "#domains/fleet";
import nodeFragment from "#relay/__generated__/SiteChipSlot_node.graphql.js";
import assertSiteKey from "../../assertSiteKey.js";
import { InterchangeChip } from "../InterchangeChip/index.js";
import { LineChip } from "../LineChip/index.js";
import { StationChip } from "../StationChip/index.js";
import { ZoneChip } from "../ZoneChip/index.js";
import type { SiteChipSlotProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The site slot of the package's chip dispatcher, which the app's Relay compile
 * takes in place of the package's default: the typename, and each metro chip
 * arm's fragment spread aliased by the type it projects.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteChipSlot_node on Node {
    __typename
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
 * A metro node as the inline mention, dispatched on its type inside the
 * package's chip dispatcher: the chip map lists it under `siteTypes` for every
 * metro type, and it renders the arm the node's typename selects, over that
 * type's aliased key: a station, an interchange, a line, a fare zone, a rolling stock, a formation, a unit or a car type.
 *
 * It renders no element of its own: the arm renders the root, a `<span>`, and
 * every native prop reaches it.
 *
 * `import { SiteChipSlot } from "./lib/index.js";`
 *
 * @implements metro.component.site_chip_slot
 * @throws When the typename is not a metro type, or the store holds no
 *   data under that type's spread.
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteChipSlot({
  node,
  typename,
  ...props
}: SiteChipSlotProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  switch (typename) {
    case "Station":
      return (
        <StationChip {...props} node={assertSiteKey(data.Station, typename)} />
      );
    case "Interchange":
      return (
        <InterchangeChip
          {...props}
          node={assertSiteKey(data.Interchange, typename)}
        />
      );
    case "Line":
      return <LineChip {...props} node={assertSiteKey(data.Line, typename)} />;
    case "Zone":
      return <ZoneChip {...props} node={assertSiteKey(data.Zone, typename)} />;
    case "RollingStock":
      return (
        <RollingStockChip
          {...props}
          node={assertSiteKey(data.RollingStock, typename)}
        />
      );
    case "Formation":
      return (
        <FormationChip
          {...props}
          node={assertSiteKey(data.Formation, typename)}
        />
      );
    case "Unit":
      return <UnitChip {...props} node={assertSiteKey(data.Unit, typename)} />;
    case "CarType":
      return (
        <CarTypeChip {...props} node={assertSiteKey(data.CarType, typename)} />
      );
    default:
      throw new Error(
        `SiteChipSlot: the chip map arms no metro type named ${typename}`,
      );
  }
}
