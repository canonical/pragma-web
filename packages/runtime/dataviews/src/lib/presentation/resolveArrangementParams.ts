import { type ArrangementParams, spellArrangementKey } from "../wire/index.js";
import listStoredIds from "./listStoredIds.js";
import type { ColumnCommandConfig } from "./types.js";

/**
 * The order and hidden columns a link carries for one table.
 */
export default function resolveArrangementParams({
  table,
  columns,
  presentation,
}: Pick<
  ColumnCommandConfig,
  "table" | "columns" | "presentation"
>): ArrangementParams {
  const order = spellArrangementKey(table, "order");
  return {
    order: Object.hasOwn(presentation, order)
      ? listStoredIds(presentation[order])
      : columns.map((column) => column.id),
    hidden: listStoredIds(presentation[spellArrangementKey(table, "hidden")]),
  };
}
