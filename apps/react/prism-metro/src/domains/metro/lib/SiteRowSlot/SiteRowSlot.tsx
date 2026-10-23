// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/SiteRowSlot_node.graphql.js";
import assertSiteKey from "../../assertSiteKey.js";
import { InterchangeRow } from "../InterchangeRow/index.js";
import { LineRow } from "../LineRow/index.js";
import { StationRow } from "../StationRow/index.js";
import { ZoneRow } from "../ZoneRow/index.js";
import type { SiteRowSlotProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The site slot of the package's row dispatcher, which the app's Relay compile
 * takes in place of the package's default: the typename, and each metro row
 * arm's fragment spread aliased by the type it projects.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteRowSlot_node on Node {
    __typename
    ...StationRow_node @alias(as: "Station")
    ...InterchangeRow_node @alias(as: "Interchange")
    ...LineRow_node @alias(as: "Line")
    ...ZoneRow_node @alias(as: "Zone")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * A metro node as the 32px list entry, dispatched on its type inside the
 * package's row dispatcher: the row map lists it under `siteTypes` for every
 * metro type, and it renders the arm the node's typename selects, over that
 * type's aliased key: a station, an interchange, a line or a fare zone.
 *
 * It renders no element of its own: the arm renders the root, an `<li>`, and
 * every native prop reaches it.
 *
 * `import { SiteRowSlot } from "./lib/index.js";`
 *
 * @implements metro.component.site_row_slot
 * @throws When the typename is not a metro type, or the store holds no
 *   data under that type's spread.
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteRowSlot({
  node,
  typename,
  ...props
}: SiteRowSlotProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  switch (typename) {
    case "Station":
      return (
        <StationRow {...props} node={assertSiteKey(data.Station, typename)} />
      );
    case "Interchange":
      return (
        <InterchangeRow
          {...props}
          node={assertSiteKey(data.Interchange, typename)}
        />
      );
    case "Line":
      return <LineRow {...props} node={assertSiteKey(data.Line, typename)} />;
    case "Zone":
      return <ZoneRow {...props} node={assertSiteKey(data.Zone, typename)} />;
    default:
      throw new Error(
        `SiteRowSlot: the row map arms no metro type named ${typename}`,
      );
  }
}
