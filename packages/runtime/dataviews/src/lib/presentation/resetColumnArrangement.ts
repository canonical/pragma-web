import { spellArrangementKey } from "../wire/index.js";
import type { ColumnCommandConfig, PresentationPatch } from "./types.js";

/**
 * The change returning a table's order, hidden columns and widths to the
 * arrangement beneath the viewer's own; other tables' keys stay.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function resetColumnArrangement({
  table,
  presentation,
}: Pick<ColumnCommandConfig, "table" | "presentation">): PresentationPatch {
  const order = spellArrangementKey(table, "order");
  const hidden = spellArrangementKey(table, "hidden");
  const widths = `${spellArrangementKey(table, "width")}.`;
  return Object.fromEntries(
    Object.keys(presentation)
      .filter(
        (key) => key === order || key === hidden || key.startsWith(widths),
      )
      .map((key) => [key, undefined]),
  );
}
