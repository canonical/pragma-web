import type { Completion } from "@canonical/dataviews-core";
import pageOf from "./pageOf.js";

/** A delivered page of rows, counted exactly and grouped by nothing. */
export default function deliverRows<TRow extends object>(
  rows: readonly TRow[],
): Completion<TRow> {
  return {
    status: "succeeded",
    page: pageOf(rows),
  };
}
