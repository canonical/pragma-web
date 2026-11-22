import { useRenderers, VIEW_PARAMS } from "@canonical/prism-core";
import { NodeList } from "@canonical/prism-projections";
import { useSearchParam } from "@canonical/router-react";
import type { ReactElement } from "react";
import { useMessages } from "#i18n";
import { FLEET_RENDERERS } from "../../../../constants.js";
import { useFleetStocks } from "../../../../hooks/index.js";

/**
 * Every rolling stock the index's operation lists, through the shared list
 * of nodes: as a table of the facts the stock's lens displays, the
 * default, or as cards, each drawing the stock's formations at one scale in
 * its specimen through the site's card arm. The renderer, the sort and the
 * selected stock are the address's (`as=`, `sort=`, `select=`), so they
 * survive a reload and travel with a link; the strip's switch links to the
 * other renderer. An instance of another type is left out. It suspends
 * until the store holds the operation.
 *
 * @note Impure: reads the Relay store, the address and the translator in
 *   scope.
 */
export default function StockList(): ReactElement {
  const t = useMessages();
  const { active } = useRenderers("list", FLEET_RENDERERS.list);
  const sort = useSearchParam(VIEW_PARAMS.sort) ?? undefined;
  const selected = useSearchParam(VIEW_PARAMS.select) ?? undefined;
  return (
    <NodeList
      empty={t("fleet.index.empty")}
      nodes={useFleetStocks()}
      renderer={active.name === "cards" ? "cards" : "table"}
      selected={selected}
      sort={sort}
    />
  );
}
