import type { SourcePage } from "../src/lib/result/index.js";

/**
 * A page of the given rows with the exact counts a complete source reports.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function buildPage<TRow extends object>(
  rows: readonly TRow[],
): SourcePage<TRow> {
  return {
    rows,
    groups: null,
    counts: {
      pageable: { kind: "exact", value: rows.length },
      matched: { kind: "exact", value: rows.length },
    },
    facets: {},
    more: null,
    cursors: null,
  };
}
