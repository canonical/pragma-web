import readTableKey from "./readTableKey.js";
import spellArrangementKey from "./spellArrangementKey.js";
import type { ArrangementParams } from "./types.js";

/**
 * Parameters carrying one table's arrangement in place of the one they
 * carried for it; every other parameter survives as it was.
 */
export default function spellArrangementParams(
  params: URLSearchParams,
  table: string,
  arrangement: ArrangementParams | null,
): URLSearchParams {
  const order = spellArrangementKey(table, "order");
  const hidden = spellArrangementKey(table, "hidden");
  // Every key that reads back as this table's, however it was spelled,
  // so none is left to shadow the new one.
  const spelled = new URLSearchParams(
    [...params].filter(([key]) => readTableKey(key)?.table !== table),
  );
  for (const id of arrangement?.order ?? []) {
    spelled.append(order, id);
  }
  for (const id of arrangement?.hidden ?? []) {
    spelled.append(hidden, id);
  }
  return spelled;
}
