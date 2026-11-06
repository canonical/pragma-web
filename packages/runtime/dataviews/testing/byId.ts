import type { RowRecord } from "../src/lib/rows/index.js";

/** The identity every fixture record carries: its own `id`. */
export default function byId(row: RowRecord): string {
  return String(row["id"]);
}
