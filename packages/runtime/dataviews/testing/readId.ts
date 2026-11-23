import type { RowRecord } from "../src/lib/rows/index.js";

/**
 * The identity every fixture record carries: its own `id`.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function readId(row: RowRecord): string {
  return String(row["id"]);
}
