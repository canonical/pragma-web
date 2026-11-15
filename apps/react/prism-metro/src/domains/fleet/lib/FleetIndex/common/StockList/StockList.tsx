import { useRenderers } from "@canonical/prism-core";
import { EntityList } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { useMessages } from "#i18n";
import { MetroCardProjection, MetroRowProjection } from "#lib/ui";
import { FLEET_RENDERERS } from "../../../../constants.js";
import { useFleetStocks } from "../../../../hooks/index.js";

/**
 * Every rolling stock the index's operation lists, in the shared list view
 * of entities: as a table, the default, each a one-line row of the site's
 * rows, or as cards, each drawing the stock's formations at one scale in its
 * specimen. The renderer is the address's (`as=`), so it survives a reload
 * and travels with a link; the strip's switch links to the other. An
 * instance of another type is left out. It suspends until the store holds
 * the operation.
 */
export default function StockList(): ReactElement {
  const t = useMessages();
  const { active } = useRenderers("list", FLEET_RENDERERS.list);
  const stocks = useFleetStocks();
  const cards = active.name === "cards";
  return (
    <EntityList
      empty={t("fleet.index.empty")}
      renderer={cards ? "cards" : "table"}
    >
      {stocks.map((stock) =>
        cards ? (
          <MetroCardProjection key={stock.uri} node={stock} />
        ) : (
          <MetroRowProjection key={stock.uri} node={stock} />
        ),
      )}
    </EntityList>
  );
}
