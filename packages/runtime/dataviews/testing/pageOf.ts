import type { SourcePage } from "../src/lib/result/index.js";

/** A page of the given rows with the exact counts a complete source reports. */
export default function pageOf<TRow extends object>(
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
