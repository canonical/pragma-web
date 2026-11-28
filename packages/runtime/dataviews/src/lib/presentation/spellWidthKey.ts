import { spellArrangementKey } from "../wire/index.js";

/** The key one table keeps a column's width under. */
export default function spellWidthKey(table: string, column: string): string {
  return `${spellArrangementKey(table, "width")}.${column}`;
}
