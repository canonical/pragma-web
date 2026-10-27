import { type EntityListView, NodeList } from "@canonical/prism-projections";
import { useRouter, useSearchParam } from "@canonical/router-react";
import type { ReactElement } from "react";
import { useLazyLoadQuery } from "react-relay";
import { useMessages } from "#i18n";
import type { FleetIndexQuery } from "#relay/__generated__/FleetIndexQuery.graphql.js";
import fleetIndexQueryNode from "#relay/__generated__/FleetIndexQuery.graphql.js";
import {
  DEFAULT_FLEET_VIEW,
  FLEET_CLASS_URI,
  FLEET_PAGE_SIZE,
  FLEET_VIEW_PARAM,
} from "../../../../constants.js";
import readFleetView from "../../../readFleetView.js";

/**
 * Every rolling stock the index's operation lists, in the shared list view
 * of nodes: as cards, each drawing the stock's formations at one scale in
 * its sidecar, or as rows. The view is the address's, so it survives a
 * reload and travels with a link; the list's toggle writes it back,
 * replacing the history entry. An instance of another type is left out. It
 * suspends until the store holds the operation.
 */
export default function StockList(): ReactElement {
  const t = useMessages();
  const router = useRouter();
  const view = readFleetView(useSearchParam(FLEET_VIEW_PARAM));
  const { ontologyClass } = useLazyLoadQuery<FleetIndexQuery>(
    fleetIndexQueryNode,
    { classUri: FLEET_CLASS_URI, count: FLEET_PAGE_SIZE },
  );
  const stocks = (ontologyClass?.instances.edges ?? []).flatMap(({ node }) =>
    node.__typename === "RollingStock" ? [node] : [],
  );
  const changeView = (next: EntityListView): void => {
    router.setSearchParams(
      { [FLEET_VIEW_PARAM]: next === DEFAULT_FLEET_VIEW ? null : next },
      { replace: true },
    );
  };
  return (
    <NodeList
      count={stocks.length}
      empty={t("fleet.index.empty")}
      kind={t("fleet.stocks.kind", { count: stocks.length })}
      nodes={stocks}
      onViewChange={changeView}
      view={view}
    />
  );
}
