import { type Count, type SourcePage, UNKNOWN_COUNT } from "../result/index.js";
import type { RelayConnection } from "./types.js";

/** One connection read as a page and the cursor it ends at, or why not. */
type RelayPageReading<TRow extends object> =
  | {
      readonly status: "read";
      readonly page: SourcePage<TRow>;
      readonly endCursor: string | null;
    }
  | { readonly status: "failed"; readonly reason: string };

/**
 * Read one Relay connection as a page. A connection with no `totalCount`
 * counts nothing rather than counting zero; one missing its edges, a
 * record or its page info fails rather than delivering a shorter page.
 */
export default function readRelayPage<TRow extends object>(
  connection: RelayConnection<TRow> | null | undefined,
): RelayPageReading<TRow> {
  if (connection === null || connection === undefined) {
    return { status: "failed", reason: "the response carries no connection" };
  }
  const { edges, pageInfo } = connection;
  if (edges === null || edges === undefined) {
    return { status: "failed", reason: "the connection carries no edges" };
  }
  const rows: TRow[] = [];
  for (const edge of edges) {
    const node = edge?.node;
    if (node === null || node === undefined) {
      return {
        status: "failed",
        reason: "the connection carries an edge without a record",
      };
    }
    rows.push(node);
  }
  if (pageInfo === null || pageInfo === undefined) {
    return { status: "failed", reason: "the connection carries no page info" };
  }
  const { endCursor, hasNextPage } = pageInfo;
  const matched: Count =
    typeof connection.totalCount === "number"
      ? { kind: "exact", value: connection.totalCount }
      : UNKNOWN_COUNT;
  const more = typeof hasNextPage === "boolean" ? hasNextPage : null;
  return {
    status: "read",
    // A page with no end cursor has no next page to reach any more.
    endCursor: typeof endCursor === "string" ? endCursor : null,
    page: {
      rows,
      groups: null,
      // Nothing collapses, so the rows the window pages over are the rows
      // that matched; the whole collection is never asked for.
      counts: { pageable: matched, matched },
      // What the operation selected; the provider holds it to what the
      // request asked for.
      facets: connection.facets ?? {},
      more,
      cursors: {
        next: more === false ? null : (endCursor ?? null),
        previous: null,
      },
    },
  };
}
