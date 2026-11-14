import { useRenderers } from "@canonical/prism-core";
import { NodeList } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { useMessages } from "#i18n";
import { FLEET_RENDERERS } from "../../../../constants.js";
import { useFleetStocks } from "../../../../hooks/index.js";

/**
 * Every rolling stock the index's operation lists, in the shared list view
 * of nodes: as a table, the default, or as cards, each drawing the stock's
 * formations at one scale in its sidecar. The renderer is the address's
 * (`as=`), so it survives a reload and travels with a link; the strip's
 * switch links to the other. An instance of another type is left out. It
 * suspends until the store holds the operation.
 */
export default function StockList(): ReactElement {
  const t = useMessages();
  const { active } = useRenderers("list", FLEET_RENDERERS.list);
  const stocks = useFleetStocks();
  return (
    <NodeList
      empty={t("fleet.index.empty")}
      nodes={stocks}
      renderer={active.name === "cards" ? "cards" : "table"}
    />
  );
}
