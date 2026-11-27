import readTableKey from "./readTableKey.js";
import type { ArrangementParams } from "./types.js";

/** The parameters one table's order and hidden columns were found under. */
type FoundKeys = { readonly order?: string; readonly hidden?: string };

/**
 * The column arrangement a set of parameters carries for each table, by
 * its id; an order with no hidden parameter hides none, and a blank value
 * names no column.
 */
export default function readArrangementParams(
  params: URLSearchParams,
): ReadonlyMap<string, ArrangementParams> {
  const tables = new Map<string, FoundKeys>();
  for (const key of params.keys()) {
    const read = readTableKey(key);
    if (read !== null) {
      const found = tables.get(read.table) ?? {};
      tables.set(read.table, { [read.part]: key, ...found });
    }
  }
  const listIds = (key: string): readonly string[] =>
    params.getAll(key).filter((id) => id !== "");
  return new Map(
    [...tables].map(([table, { order, hidden }]) => [
      table,
      {
        order: order === undefined ? null : listIds(order),
        hidden: hidden === undefined ? [] : listIds(hidden),
      },
    ]),
  );
}
