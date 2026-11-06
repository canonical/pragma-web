import {
  type Count,
  type PageCursors,
  type SourceCounts,
  type SourcePage,
  UNKNOWN_COUNT,
} from "../src/lib/result/index.js";
import type { SettledRow } from "./types.js";

/** Counts where only `pageable` — the one a bar pages over — is claimed. */
const countingPageable = (pageable: Count): SourceCounts => ({
  pageable,
  matched: UNKNOWN_COUNT,
  total: UNKNOWN_COUNT,
});

/** A page of `rows` records, counted and continued as the settled fields say. */
export default function buildSettledPage({
  rows,
  pageable = UNKNOWN_COUNT,
  more = null,
  cursors = null,
}: {
  readonly rows: number;
  /** What the source counts; nothing by default. */
  readonly pageable?: Count;
  /** The source's own word on a further page. */
  readonly more?: boolean | null;
  /** The tokens the page handed back; none for an offset source. */
  readonly cursors?: PageCursors | null;
}): SourcePage<SettledRow> {
  return {
    rows: Array.from({ length: rows }, (_unused, at) => ({ id: `m${at}` })),
    groups: null,
    counts: countingPageable(pageable),
    facets: {},
    more,
    cursors,
  };
}
