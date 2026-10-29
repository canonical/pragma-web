// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import {
  CarTypeCommand,
  FormationCommand,
  RollingStockCommand,
  UnitCommand,
} from "#domains/fleet";
import nodeFragment from "#relay/__generated__/SiteCommandSlot_node.graphql.js";
import assertSiteKey from "../../assertSiteKey.js";
import { InterchangeCommand } from "../InterchangeCommand/index.js";
import { LineCommand } from "../LineCommand/index.js";
import { StationCommand } from "../StationCommand/index.js";
import { ZoneCommand } from "../ZoneCommand/index.js";
import type { SiteCommandSlotProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The site slot of the package's command dispatcher, which the app's Relay
 * compile takes in place of the package's default: the typename, and each metro
 * command arm's fragment spread aliased by the type it projects.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteCommandSlot_node on Node {
    __typename
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
 * A metro node as the 56px command-palette result, dispatched on its type
 * inside the package's command dispatcher: the command map lists it under
 * `siteTypes` for every metro type, and it renders the arm the node's typename
 * selects, over that type's aliased key: a station, an interchange, a line or a
 * fare zone.
 *
 * It renders no element of its own: the arm renders the root, an `<li>`, and
 * every native prop reaches it.
 *
 * `import { SiteCommandSlot } from "./lib/index.js";`
 *
 * @implements metro.component.site_command_slot
 * @throws When the typename is not a metro type, or the store holds no
 *   data under that type's spread.
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteCommandSlot({
  node,
  typename,
  ...props
}: SiteCommandSlotProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  switch (typename) {
    case "Station":
      return (
        <StationCommand
          {...props}
          node={assertSiteKey(data.Station, typename)}
        />
      );
    case "Interchange":
      return (
        <InterchangeCommand
          {...props}
          node={assertSiteKey(data.Interchange, typename)}
        />
      );
    case "Line":
      return (
        <LineCommand {...props} node={assertSiteKey(data.Line, typename)} />
      );
    case "Zone":
      return (
        <ZoneCommand {...props} node={assertSiteKey(data.Zone, typename)} />
      );
    case "RollingStock":
      return (
        <RollingStockCommand
          {...props}
          node={assertSiteKey(data.RollingStock, typename)}
        />
      );
    case "Formation":
      return (
        <FormationCommand
          {...props}
          node={assertSiteKey(data.Formation, typename)}
        />
      );
    case "Unit":
      return (
        <UnitCommand {...props} node={assertSiteKey(data.Unit, typename)} />
      );
    case "CarType":
      return (
        <CarTypeCommand
          {...props}
          node={assertSiteKey(data.CarType, typename)}
        />
      );
    default:
      throw new Error(
        `SiteCommandSlot: the command map arms no metro type named ${typename}`,
      );
  }
}
