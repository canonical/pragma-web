import type { Completion } from "@canonical/dataviews-core";
import buildPage from "./buildPage.js";

/** A delivered page of rows, counted exactly and grouped by nothing. */
export default function deliverRows<TRow extends object>(
  rows: readonly TRow[],
): Completion<TRow> {
  return {
    status: "succeeded",
    page: buildPage(rows),
  };
}
