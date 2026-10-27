// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import {
  CarTypeCard,
  FormationCard,
  RollingStockCard,
  UnitCard,
} from "#domains/fleet";
import nodeFragment from "#relay/__generated__/SiteCardSlot_node.graphql.js";
import assertSiteKey from "../../assertSiteKey.js";
import { InterchangeCard } from "../InterchangeCard/index.js";
import { LineCard } from "../LineCard/index.js";
import { StationCard } from "../StationCard/index.js";
import { ZoneCard } from "../ZoneCard/index.js";
import type { SiteCardSlotProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The site slot of the package's card dispatcher, which the app's Relay compile
 * takes in place of the package's default: the typename, and each metro card
 * arm's fragment spread aliased by the type it projects.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteCardSlot_node on Node {
    __typename
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
 * A metro node as the card, dispatched on its type inside the package's card
 * dispatcher: the card map lists it under `siteTypes` for every metro type, and
 * it renders the arm the node's typename selects, over that type's aliased key:
 * a station, an interchange, a line, a fare zone, a rolling stock, a formation, a unit or a car type.
 *
 * It renders no element of its own: the arm renders the root, a `<div>`, and
 * every native prop reaches it.
 *
 * `import { SiteCardSlot } from "./lib/index.js";`
 *
 * @implements metro.component.site_card_slot
 * @throws When the typename is not a metro type, or the store holds no
 *   data under that type's spread.
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteCardSlot({
  node,
  typename,
  ...props
}: SiteCardSlotProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  switch (typename) {
    case "Station":
      return (
        <StationCard {...props} node={assertSiteKey(data.Station, typename)} />
      );
    case "Interchange":
      return (
        <InterchangeCard
          {...props}
          node={assertSiteKey(data.Interchange, typename)}
        />
      );
    case "Line":
      return <LineCard {...props} node={assertSiteKey(data.Line, typename)} />;
    case "Zone":
      return <ZoneCard {...props} node={assertSiteKey(data.Zone, typename)} />;
    case "RollingStock":
      return (
        <RollingStockCard
          {...props}
          node={assertSiteKey(data.RollingStock, typename)}
        />
      );
    case "Formation":
      return (
        <FormationCard
          {...props}
          node={assertSiteKey(data.Formation, typename)}
        />
      );
    case "Unit":
      return <UnitCard {...props} node={assertSiteKey(data.Unit, typename)} />;
    case "CarType":
      return (
        <CarTypeCard {...props} node={assertSiteKey(data.CarType, typename)} />
      );
    default:
      throw new Error(
        `SiteCardSlot: the card map arms no metro type named ${typename}`,
      );
  }
}
