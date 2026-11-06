import { createPage, type SourcePage } from "@canonical/dataviews-core";

/** A page of rows, counted exactly and grouped by nothing. */
export default function buildPage<TRow extends object>(
  rows: readonly TRow[],
): SourcePage<TRow> {
  return createPage({ rows, matched: rows.length, total: rows.length });
}
