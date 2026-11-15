import { describe, expect, it } from "vitest";
import {
  DEFAULT_WINDOW,
  EMPTY_SLICE,
  type GroupTerm,
  type Predicate,
  type ResultWindow,
  type Slice,
  type SortTerm,
} from "../query/index.js";
import type {
  Completion,
  GroupSummary,
  QueryIssue,
  SourceCounts,
  SourcePage,
} from "../result/index.js";
import type { RowRecord } from "../rows/index.js";
import createQueryCoordinator from "./createQueryCoordinator.js";
import type { QueryCoordinator } from "./types.js";

const buildSlice = (overrides: Partial<Slice> = {}): Slice => ({
  filter: [],
  search: null,
  sort: [],
  group: [],
  ...overrides,
});

const buildWindow = (overrides: Partial<ResultWindow> = {}): ResultWindow => ({
  ...DEFAULT_WINDOW,
  ...overrides,
});

const buildStatusPredicate = (...operands: string[]): Predicate => ({
  field: "status",
  operator: "isAny",
  operands,
});

/** What an ungrouped source counts: the matched rows are the visible ones. */
const buildCounts = (matched: number): SourceCounts => ({
  pageable: { kind: "exact", value: matched },
  matched: { kind: "exact", value: matched },
});

const buildSucceeded = (
  rows: readonly RowRecord[],
  overrides: Partial<SourcePage> = {},
): Completion => ({
  status: "succeeded",
  page: {
    rows,
    groups: null,
    counts: buildCounts(rows.length),
    facets: {},
    more: null,
    cursors: null,
    ...overrides,
  },
});

const buildFailed = (reason: string, cause: unknown = null): Completion => ({
  status: "failed",
  failure: { reason, cause, transient: null },
});

const buildRefused = (reason: string): Completion => ({
  status: "refused",
  refusals: [
    {
      part: "filter",
      code: "undeclared-field",
      field: "zone",
      operator: "isAny",
      reason,
    },
  ],
});

/** Dispatch a query change and return its request id, failing loudly. */
const dispatchRequest = (
  coordinator: QueryCoordinator,
  command: Parameters<QueryCoordinator["dispatch"]>[0],
): string => {
  const result = coordinator.dispatch(command);
  if (result.status !== "accepted" || result.requestId === null) {
    throw new Error("expected an accepted command with a request id");
  }
  return result.requestId;
};

/** Refresh and return the request id. */
const refreshRequest = (coordinator: QueryCoordinator): string =>
  coordinator.refresh();

describe("createQueryCoordinator", () => {
  it("starts idle on the configured start's slice and window", () => {
    const coordinator = createQueryCoordinator({
      start: {
        slice: buildSlice({ filter: [buildStatusPredicate("failed")] }),
        window: buildWindow({ page: 2, size: 25 }),
      },
    });
    const state = coordinator.state;
    expect(state.result.status).toBe("idle");
    expect(state.window).toEqual(buildWindow({ page: 2, size: 25 }));
    expect(state.slice.filter).toHaveLength(1);
    expect(state.resultMatchesQuery).toBe(false);
  });

  it("stands idle on an initial query, and resets to the start", () => {
    const initial = {
      slice: { ...EMPTY_SLICE, search: "web" },
      window: { ...DEFAULT_WINDOW, page: 3 },
    };
    const coordinator = createQueryCoordinator({
      start: { slice: { ...EMPTY_SLICE, search: "seed" } },
      initial,
    });
    expect(coordinator.state).toMatchObject({
      slice: { search: "web" },
      window: { page: 3 },
      pendingRequestId: null,
      result: { status: "idle" },
    });
    // Copied, like a start: the caller's objects are not the state.
    expect(coordinator.state.slice).not.toBe(initial.slice);
    // Standing there already, adopting it again issues nothing.
    expect(coordinator.adopt(initial)).toBeNull();
    coordinator.reset();
    expect(coordinator.state.slice.search).toBe("seed");
    expect(coordinator.state.window.page).toBe(1);
  });

  it("keeps the facets it published when a later request fails", () => {
    const coordinator = createQueryCoordinator({});
    const first = dispatchRequest(coordinator, {
      kind: "setPredicate",
      predicate: buildStatusPredicate("failed"),
    });
    coordinator.complete(
      first,
      buildSucceeded([{ id: "machine-1" }], {
        facets: {
          status: {
            kind: "values",
            values: [{ value: "failed", count: { kind: "exact", value: 1 } }],
          },
        },
      }),
    );
    const published = coordinator.state.result.facets;
    const second = dispatchRequest(coordinator, {
      kind: "setPredicate",
      predicate: buildStatusPredicate("cancelled"),
    });
    coordinator.complete(second, buildFailed("offline"));
    expect(coordinator.state.result.status).toBe("stale");
    expect(coordinator.state.result.facets).toBe(published);
    expect(published).not.toBeNull();
  });

  it("adopts a slice again once a command or a reset has moved away from it", () => {
    const failedOnly = {
      slice: buildSlice({ filter: [buildStatusPredicate("failed")] }),
      window: buildWindow(),
    };
    const coordinator = createQueryCoordinator({});
    coordinator.adopt(failedOnly);
    dispatchRequest(coordinator, {
      kind: "setPredicate",
      predicate: buildStatusPredicate("cancelled"),
    });
    // Back to the first query, on another page: its slice is in force again.
    expect(
      coordinator.adopt({ ...failedOnly, window: buildWindow({ page: 2 }) }),
    ).not.toBeNull();
    expect(coordinator.state.slice.filter).toEqual([
      buildStatusPredicate("failed"),
    ]);
    coordinator.reset();
    expect(
      coordinator.adopt({ ...failedOnly, window: buildWindow({ page: 3 }) }),
    ).not.toBeNull();
    expect(coordinator.state.slice.filter).toEqual([
      buildStatusPredicate("failed"),
    ]);
  });

  it("issues a request on a query change, resets the window and retains rows", () => {
    const coordinator = createQueryCoordinator({
      start: { window: buildWindow({ page: 4 }) },
    });
    const first = dispatchRequest(coordinator, {
      kind: "setPredicate",
      predicate: buildStatusPredicate("failed"),
    });
    expect(coordinator.state.window).toEqual(buildWindow());
    coordinator.complete(first, buildSucceeded([{ id: "machine-1" }]));
    expect(coordinator.state.result.status).toBe("ready");
    expect(coordinator.state.resultMatchesQuery).toBe(true);

    const second = dispatchRequest(coordinator, {
      kind: "setPredicate",
      predicate: buildStatusPredicate("cancelled"),
    });
    expect(second).not.toBe(first);
    // Different query pending: retained rows and counts keep their old
    // provenance.
    expect(coordinator.state.result.status).toBe("pending");
    expect(coordinator.state.result.rows).toEqual([{ id: "machine-1" }]);
    expect(coordinator.state.result.counts).toEqual(buildCounts(1));
    expect(coordinator.state.result.provenance?.requestId).toBe(first);
    expect(coordinator.state.resultMatchesQuery).toBe(false);
  });

  it("keeps retained rows unmatched after a window-only change", () => {
    const coordinator = createQueryCoordinator();
    const request = dispatchRequest(coordinator, {
      kind: "setPredicate",
      predicate: buildStatusPredicate("failed"),
    });
    coordinator.complete(request, buildSucceeded([{ id: "machine-1" }]));
    expect(coordinator.state.resultMatchesQuery).toBe(true);

    dispatchRequest(coordinator, { kind: "navigateWindow", page: 2 });
    const result = coordinator.state.result;
    expect(result.status).toBe("pending");
    expect(result.rows).toEqual([{ id: "machine-1" }]);
    expect(coordinator.state.resultMatchesQuery).toBe(false);
    expect(coordinator.state.window).toEqual(buildWindow({ page: 2 }));
  });

  it("ignores completions for superseded requests", () => {
    const coordinator = createQueryCoordinator();
    const first = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "yak",
    });
    const second = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "zebu",
    });
    // The slower first response arrives after the second request replaced it.
    expect(coordinator.complete(first, buildSucceeded([{ id: "stale" }]))).toBe(
      false,
    );
    expect(coordinator.state.result.rows).toBeNull();
    expect(coordinator.state.result.problem).toBeNull();

    expect(
      coordinator.complete(second, buildSucceeded([{ id: "fresh" }])),
    ).toBe(true);
    expect(coordinator.state.result.rows).toEqual([{ id: "fresh" }]);
  });

  it("ignores failure completions for superseded requests", () => {
    const coordinator = createQueryCoordinator();
    const first = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "yak",
    });
    const second = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "zebu",
    });
    expect(coordinator.complete(first, buildFailed("gateway"))).toBe(false);
    expect(coordinator.state.result.problem).toBeNull();
    expect(
      coordinator.complete(second, buildSucceeded([{ id: "fresh" }])),
    ).toBe(true);
  });

  it("publishes rows, groups, counts, more, cursors and provenance together", () => {
    const coordinator = createQueryCoordinator();
    const request = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "yak",
    });
    const rows = [{ id: "machine-1" }, { id: "machine-2" }];
    coordinator.complete(
      request,
      buildSucceeded(rows, {
        counts: buildCounts(9),
        more: true,
        cursors: { next: "c:machine-2", previous: null },
      }),
    );
    const state = coordinator.state;
    expect(state.result).toEqual({
      status: "ready",
      rows: [{ id: "machine-1" }, { id: "machine-2" }],
      groups: null,
      counts: buildCounts(9),
      facets: {},
      more: true,
      cursors: { next: "c:machine-2", previous: null },
      provenance: {
        requestId: request,
        slice: state.slice,
        window: state.window,
      },
      problem: null,
    });
    expect(state.resultMatchesQuery).toBe(true);
    // The published rows are a defensive copy of the caller's array.
    rows.push({ id: "machine-3" });
    expect(coordinator.state.result.rows).toHaveLength(2);
  });

  it("copies the envelope, so a reused one cannot change what was published", () => {
    const coordinator = createQueryCoordinator();
    const request = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "yak",
    });
    // A source is free to hand the same envelope back on every delivery; a
    // published snapshot must not move when it fills the next one in.
    const groups: GroupSummary[] = [
      { path: ["failed"], count: { kind: "exact", value: 2 } },
    ];
    const page: SourcePage = {
      rows: [{ id: "machine-1" }],
      groups,
      counts: buildCounts(1),
      facets: {},
      more: null,
      cursors: { next: "c:machine-1", previous: null },
    };
    coordinator.complete(request, { status: "succeeded", page });
    const published = coordinator.state.result;
    expect(published.groups).toEqual(groups);
    expect(published.groups).not.toBe(groups);
    expect(published.counts).not.toBe(page.counts);
    expect(published.cursors).toEqual({ next: "c:machine-1", previous: null });
    expect(published.cursors).not.toBe(page.cursors);
    groups.push({ path: ["ready"], count: { kind: "exact", value: 1 } });
    expect(coordinator.state.result.groups).toHaveLength(1);
  });

  it("stamps the slice and window the rows answer, never what the source says", () => {
    const coordinator = createQueryCoordinator({
      start: { window: buildWindow({ size: 25 }) },
    });
    const request = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "yak",
    });
    coordinator.complete(request, buildSucceeded([{ id: "machine-1" }]));
    const { result, slice: applied, window: paged } = coordinator.state;
    expect(result.provenance?.slice).toBe(applied);
    expect(result.provenance?.window).toBe(paged);
    expect(result.provenance?.slice.search).toBe("yak");
    expect(result.provenance?.window).toEqual(buildWindow({ size: 25 }));
  });

  it("publishes a request completion at most once", () => {
    const coordinator = createQueryCoordinator();
    const request = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "yak",
    });
    expect(
      coordinator.complete(request, buildSucceeded([{ id: "machine-1" }])),
    ).toBe(true);
    // A duplicated delivery of the same completion must not overwrite.
    expect(
      coordinator.complete(request, buildFailed("duplicate delivery")),
    ).toBe(false);
    expect(coordinator.state.result.rows).toEqual([{ id: "machine-1" }]);
    expect(coordinator.state.result.problem).toBeNull();
  });

  it("reports a failed refresh over rows that still answer the query", () => {
    const coordinator = createQueryCoordinator();
    const request = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "yak",
    });
    coordinator.complete(request, buildSucceeded([{ id: "machine-1" }]));

    const refreshId = refreshRequest(coordinator);
    expect(coordinator.state.result.status).toBe("refreshing");
    expect(coordinator.state.result.rows).toEqual([{ id: "machine-1" }]);
    expect(coordinator.state.resultMatchesQuery).toBe(true);

    const cause = new Error("gateway down");
    coordinator.complete(refreshId, buildFailed("gateway down", cause));
    const result = coordinator.state.result;
    // The rows are usable and the failure is real, so both are reported.
    expect(result.status).toBe("refresh-failed");
    expect(result.rows).toEqual([{ id: "machine-1" }]);
    expect(result.problem).toEqual({
      status: "failed",
      failure: { reason: "gateway down", cause, transient: null },
    });
    expect(result.provenance?.requestId).toBe(request);
    expect(coordinator.state.resultMatchesQuery).toBe(true);
  });

  it("reports a refusal over rows that still answer the query", () => {
    const coordinator = createQueryCoordinator();
    const request = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "yak",
    });
    coordinator.complete(request, buildSucceeded([{ id: "machine-1" }]));
    const refusal = buildRefused('field "zone" cannot be filtered');
    coordinator.complete(refreshRequest(coordinator), refusal);
    const result = coordinator.state.result;
    expect(result.status).toBe("refresh-failed");
    expect(result.rows).toEqual([{ id: "machine-1" }]);
    expect(result.problem).toEqual({
      status: "refused",
      refusals: [
        {
          part: "filter",
          code: "undeclared-field",
          field: "zone",
          operator: "isAny",
          reason: 'field "zone" cannot be filtered',
        },
      ],
    });
  });

  it("publishes refreshed rows on a successful refresh", () => {
    const coordinator = createQueryCoordinator();
    const request = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "yak",
    });
    coordinator.complete(request, buildSucceeded([{ id: "machine-1" }]));
    const refreshId = refreshRequest(coordinator);
    coordinator.complete(
      refreshId,
      buildSucceeded([{ id: "machine-1" }, { id: "machine-2" }]),
    );
    const result = coordinator.state.result;
    expect(result.status).toBe("ready");
    expect(result.rows).toHaveLength(2);
    expect(result.provenance?.requestId).toBe(refreshId);
    expect(coordinator.state.resultMatchesQuery).toBe(true);
  });

  it("fails without rows when an initial request fails", () => {
    const coordinator = createQueryCoordinator();
    const request = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "yak",
    });
    coordinator.complete(request, buildFailed("offline"));
    const result = coordinator.state.result;
    expect(result.status).toBe("failed");
    expect(result.rows).toBeNull();
    expect(result.problem).toEqual({
      status: "failed",
      failure: { reason: "offline", cause: null, transient: null },
    });
  });

  it("fails without rows when an initial request is refused", () => {
    const coordinator = createQueryCoordinator();
    const request = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "yak",
    });
    coordinator.complete(request, buildRefused("this source cannot search"));
    expect(coordinator.state.result.status).toBe("failed");
    expect(coordinator.state.result.problem?.status).toBe("refused");
  });

  it("keeps retained rows unmatched when a different query fails", () => {
    const coordinator = createQueryCoordinator();
    const request = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "yak",
    });
    coordinator.complete(request, buildSucceeded([{ id: "machine-1" }]));
    const failedRequest = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "zebu",
    });
    coordinator.complete(failedRequest, buildFailed("offline"));
    const result = coordinator.state.result;
    // The retained rows belong to the old query; the failure is recorded and
    // the rows are never described as results of the current query.
    expect(result.status).toBe("stale");
    expect(result.rows).toEqual([{ id: "machine-1" }]);
    expect(result.problem?.status).toBe("failed");
    expect(coordinator.state.resultMatchesQuery).toBe(false);
  });

  it("marks an earlier query's empty result stale when the current one fails", () => {
    const coordinator = createQueryCoordinator();
    coordinator.complete(
      dispatchRequest(coordinator, { kind: "setSearch", search: "yak" }),
      buildSucceeded([]),
    );
    coordinator.complete(
      dispatchRequest(coordinator, { kind: "setSearch", search: "zebu" }),
      buildFailed("offline"),
    );
    expect(coordinator.state.result.status).toBe("stale");
    expect(coordinator.state.result.rows).toEqual([]);
  });

  it("stays stale until the current query succeeds, then reports ready", () => {
    const coordinator = createQueryCoordinator();
    coordinator.complete(
      dispatchRequest(coordinator, { kind: "setSearch", search: "yak" }),
      buildSucceeded([{ id: "machine-1" }]),
    );
    coordinator.complete(
      dispatchRequest(coordinator, { kind: "setSearch", search: "zebu" }),
      buildFailed("offline"),
    );
    coordinator.complete(
      refreshRequest(coordinator),
      buildFailed("still offline"),
    );
    expect(coordinator.state.result.status).toBe("stale");
    expect(coordinator.state.result.problem).toEqual({
      status: "failed",
      failure: { reason: "still offline", cause: null, transient: null },
    });

    coordinator.complete(
      dispatchRequest(coordinator, { kind: "setSearch", search: "gnu" }),
      buildSucceeded([{ id: "machine-2" }]),
    );
    expect(coordinator.state.result.status).toBe("ready");
    expect(coordinator.state.result.problem).toBeNull();
    expect(coordinator.state.resultMatchesQuery).toBe(true);
  });

  it("issues no request for a semantically unchanged edit", () => {
    const coordinator = createQueryCoordinator({
      start: {
        slice: buildSlice({ search: "yak" }),
        window: buildWindow({ page: 3, size: 25 }),
      },
    });
    const result = coordinator.dispatch({ kind: "setSearch", search: "yak" });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.requestId).toBeNull();
    expect(coordinator.state.result.status).toBe("idle");
    expect(coordinator.state.window).toEqual(
      buildWindow({ page: 3, size: 25 }),
    );
  });

  it("issues no request when navigating to the current window", () => {
    const coordinator = createQueryCoordinator({
      start: { window: buildWindow({ page: 2, size: 25 }) },
    });
    const result = coordinator.dispatch({
      kind: "navigateWindow",
      page: 2,
      size: 25,
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.requestId).toBeNull();
  });

  it("adopts a query as one object, superseding pending requests", () => {
    const coordinator = createQueryCoordinator();
    const stale = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "yak",
    });
    const adopted = coordinator.adopt({
      slice: buildSlice({
        search: "zebu",
        sort: [{ field: "name", direction: "asc" }],
      }),
      window: buildWindow({ page: 2, size: 25 }),
    });
    if (adopted === null) {
      throw new Error("expected an adopted request");
    }
    expect(coordinator.state.slice.search).toBe("zebu");
    expect(coordinator.state.window).toEqual(
      buildWindow({ page: 2, size: 25 }),
    );
    expect(coordinator.state.result.status).toBe("pending");
    // The superseded request's completion never publishes.
    expect(coordinator.complete(stale, buildSucceeded([{ id: "stale" }]))).toBe(
      false,
    );
    expect(
      coordinator.complete(adopted, buildSucceeded([{ id: "adopted" }])),
    ).toBe(true);
  });

  it("adopts an identical query without issuing a request", () => {
    const start = buildSlice({ search: "yak" });
    const coordinator = createQueryCoordinator({
      start: { slice: start, window: buildWindow({ page: 2, size: 25 }) },
    });
    expect(
      coordinator.adopt({
        slice: start,
        window: buildWindow({ page: 2, size: 25 }),
      }),
    ).toBeNull();
    expect(coordinator.state.result.status).toBe("idle");
  });

  it("adopts a canonically equal spelling without issuing a request", () => {
    const coordinator = createQueryCoordinator({
      start: {
        slice: buildSlice({
          filter: [buildStatusPredicate("failed", "cancelled")],
        }),
      },
    });
    const respeled = buildSlice({
      filter: [buildStatusPredicate("cancelled", "failed")],
    });
    expect(
      coordinator.adopt({ slice: respeled, window: buildWindow() }),
    ).toBeNull();
    expect(coordinator.state.result.status).toBe("idle");
  });

  it("takes the cursor and the collapsed groups into request identity", () => {
    const coordinator = createQueryCoordinator({
      start: { window: buildWindow({ page: 2, cursor: "c:m2" }) },
    });
    // The same page reached by the same token is the same request…
    expect(
      coordinator.adopt({
        slice: buildSlice(),
        window: buildWindow({ page: 2, cursor: "c:m2" }),
      }),
    ).toBeNull();
    // …while another token for that page, or a collapsed group, is not.
    expect(
      coordinator.adopt({
        slice: buildSlice(),
        window: buildWindow({ page: 2, cursor: "c:m4" }),
      }),
    ).not.toBeNull();
    expect(
      coordinator.adopt({
        slice: buildSlice(),
        window: buildWindow({
          page: 2,
          cursor: "c:m4",
          collapsed: [["failed"]],
        }),
      }),
    ).not.toBeNull();
  });

  it("distinguishes non-finite from null operands in request identity", () => {
    const coordinator = createQueryCoordinator();
    const withNaN = buildSlice({
      filter: [{ field: "cpu", operator: "gte", operands: [Number.NaN] }],
    });
    const withNull = buildSlice({
      filter: [{ field: "cpu", operator: "gte", operands: [null] }],
    });
    expect(
      coordinator.adopt({ slice: withNaN, window: buildWindow() }),
    ).not.toBeNull();
    expect(
      coordinator.adopt({ slice: withNull, window: buildWindow() }),
    ).not.toBeNull();
  });

  it("distinguishes NaN from Infinity and from look-alike strings", () => {
    const withNaN = buildSlice({
      filter: [{ field: "cpu", operator: "gte", operands: [Number.NaN] }],
    });
    const withInfinity = buildSlice({
      filter: [
        { field: "cpu", operator: "gte", operands: [Number.POSITIVE_INFINITY] },
      ],
    });
    const withString = buildSlice({
      filter: [{ field: "cpu", operator: "gte", operands: ["NaN"] }],
    });
    const first = createQueryCoordinator();
    expect(
      first.adopt({ slice: withNaN, window: buildWindow() }),
    ).not.toBeNull();
    expect(
      first.adopt({ slice: withInfinity, window: buildWindow() }),
    ).not.toBeNull();

    const second = createQueryCoordinator();
    expect(
      second.adopt({ slice: withNaN, window: buildWindow() }),
    ).not.toBeNull();
    expect(
      second.adopt({ slice: withString, window: buildWindow() }),
    ).not.toBeNull();
  });

  it("treats a key-order respelling as a canonical no-op", () => {
    const coordinator = createQueryCoordinator({
      start: {
        slice: buildSlice({
          filter: [buildStatusPredicate("failed", "cancelled")],
          sort: [{ field: "name", direction: "asc" }],
          group: [{ field: "zone" }],
        }),
      },
    });
    const respeled = buildSlice({
      filter: [
        {
          operands: ["cancelled", "failed"],
          operator: "isAny",
          field: "status",
        },
      ],
      sort: [{ direction: "asc", field: "name" }],
      group: [{ field: "zone" }],
    });
    expect(
      coordinator.adopt({ slice: respeled, window: buildWindow() }),
    ).toBeNull();
    expect(coordinator.state.result.status).toBe("idle");
  });

  it("keeps adopted state immune to nested caller mutations", () => {
    const coordinator = createQueryCoordinator();
    const predicate = {
      field: "status",
      operator: "isAny" as const,
      operands: ["failed"],
    };
    const path = ["failed"];
    const callerWindow = buildWindow({ page: 2, size: 25, collapsed: [path] });
    const request = coordinator.adopt({
      slice: buildSlice({ filter: [predicate] }),
      window: callerWindow,
    });
    if (request === null) {
      throw new Error("expected an adopted request");
    }
    coordinator.complete(request, buildSucceeded([{ id: "machine-1" }]));
    predicate.operands.push("cancelled");
    path.push("eu-west");
    (callerWindow as { page: number }).page = 9;
    expect(coordinator.state.slice.filter.at(0)?.operands).toEqual(["failed"]);
    expect(coordinator.state.window).toEqual(
      buildWindow({ page: 2, size: 25, collapsed: [["failed"]] }),
    );
  });

  it("keeps a dispatched command's own objects out of published state", () => {
    const coordinator = createQueryCoordinator();
    const terms: SortTerm[] = [{ field: "name", direction: "asc" }];
    const path = ["failed"];
    coordinator.dispatch({ kind: "setSort", sort: terms });
    coordinator.dispatch({ kind: "setCollapsed", collapsed: [path] });
    (terms.at(0) as { field: string }).field = "cpu";
    path.push("eu-west");
    expect(coordinator.state.slice.sort).toEqual([
      { field: "name", direction: "asc" },
    ]);
    expect(coordinator.state.window.collapsed).toEqual([["failed"]]);
  });

  it("keeps the slice's identity across a window-only move", () => {
    // A source may cache what it filtered and sorted against the slice it
    // was handed; a page turn must not look like a new query to it.
    const coordinator = createQueryCoordinator();
    coordinator.dispatch({ kind: "setSearch", search: "yak" });
    const applied = coordinator.state.slice;
    coordinator.dispatch({ kind: "navigateWindow", page: 3 });
    expect(coordinator.state.slice).toBe(applied);
    coordinator.dispatch({ kind: "setCollapsed", collapsed: [["failed"]] });
    expect(coordinator.state.slice).toBe(applied);
    coordinator.dispatch({ kind: "setSearch", search: "ox" });
    expect(coordinator.state.slice).not.toBe(applied);
  });

  it("takes a page of one, the smallest window there is", () => {
    const coordinator = createQueryCoordinator({
      start: { window: buildWindow({ size: 1 }) },
    });
    expect(coordinator.state.window.size).toBe(1);
    const request = dispatchRequest(coordinator, {
      kind: "navigateWindow",
      page: 2,
    });
    expect(coordinator.state.pendingRequestId).toBe(request);
    expect(coordinator.state.window).toEqual(buildWindow({ page: 2, size: 1 }));
  });

  it("keeps the configured window immune to caller mutations", () => {
    const callerWindow = buildWindow({ page: 3, size: 25 });
    const coordinator = createQueryCoordinator({
      start: { window: callerWindow },
    });
    (callerWindow as { page: number }).page = 7;
    expect(coordinator.state.window).toEqual(
      buildWindow({ page: 3, size: 25 }),
    );
  });

  it("freezes adopted nested state against mutation", () => {
    const coordinator = createQueryCoordinator();
    const request = coordinator.adopt({
      slice: buildSlice({ filter: [buildStatusPredicate("failed")] }),
      window: buildWindow(),
    });
    if (request === null) {
      throw new Error("expected an adopted request");
    }
    const filter = coordinator.state.slice.filter as Predicate[];
    expect(() => filter.push(buildStatusPredicate("cancelled"))).toThrow();
  });

  it("clears the problem when a new request begins", () => {
    const coordinator = createQueryCoordinator();
    const first = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "yak",
    });
    coordinator.complete(first, buildFailed("offline"));
    expect(coordinator.state.result.problem?.status).toBe("failed");
    dispatchRequest(coordinator, { kind: "setSearch", search: "zebu" });
    expect(coordinator.state.result.problem).toBeNull();
    expect(coordinator.state.result.status).toBe("pending");
  });

  it("issues distinct request ids across coordinator instances", () => {
    const a = createQueryCoordinator();
    const b = createQueryCoordinator();
    const requestA = dispatchRequest(a, { kind: "navigateWindow", page: 2 });
    const requestB = dispatchRequest(b, { kind: "navigateWindow", page: 2 });
    expect(requestA).not.toBe(requestB);
  });

  it("ignores completions when idle without a request", () => {
    const coordinator = createQueryCoordinator();
    expect(
      coordinator.complete("does-not-exist", buildSucceeded([{ id: "bogus" }])),
    ).toBe(false);
    expect(
      coordinator.complete(
        null as unknown as string,
        buildSucceeded([{ id: "bogus" }]),
      ),
    ).toBe(false);
    expect(coordinator.state.result.rows).toBeNull();
  });

  it("rejects invalid starting and adopted windows at intake", () => {
    expect(() =>
      createQueryCoordinator({ start: { window: buildWindow({ page: 0 }) } }),
    ).toThrow("page must be a positive integer");
    expect(() =>
      createQueryCoordinator({ start: { window: buildWindow({ size: 0 }) } }),
    ).toThrow("size must be a positive integer");
    expect(() =>
      createQueryCoordinator({
        start: { window: buildWindow({ cursor: "" }) },
      }),
    ).toThrow("cursor must not be empty; use null to clear it");
    const coordinator = createQueryCoordinator();
    expect(() =>
      coordinator.adopt({
        slice: buildSlice(),
        window: buildWindow({ page: -1 }),
      }),
    ).toThrow("page must be a positive integer");
    expect(() =>
      coordinator.adopt({
        slice: buildSlice(),
        window: buildWindow({ size: 1.5 }),
      }),
    ).toThrow("size must be a positive integer");
    expect(() =>
      coordinator.adopt({
        slice: buildSlice(),
        window: buildWindow({ cursor: "" }),
      }),
    ).toThrow("cursor must not be empty; use null to clear it");
  });

  it("keeps the configured start immune to caller mutations", () => {
    const start = buildSlice({
      filter: [buildStatusPredicate("failed")],
      sort: [{ field: "name", direction: "asc" }],
      group: [{ field: "zone" }],
    });
    const coordinator = createQueryCoordinator({ start: { slice: start } });
    (start.filter as Predicate[]).push(buildStatusPredicate("cancelled"));
    (start.sort as SortTerm[]).push({ field: "zone", direction: "desc" });
    (start.group as GroupTerm[]).push({ field: "owner" });
    coordinator.dispatch({ kind: "navigateWindow", page: 3 });
    coordinator.reset();
    expect(coordinator.state.slice.filter).toEqual([
      buildStatusPredicate("failed"),
    ]);
    expect(coordinator.state.slice.sort).toEqual([
      { field: "name", direction: "asc" },
    ]);
    expect(coordinator.state.slice.group).toEqual([{ field: "zone" }]);
  });

  it("passes command rejections through without a request", () => {
    const coordinator = createQueryCoordinator();
    const result = coordinator.dispatch({ kind: "navigateWindow", page: 0 });
    if (result.status !== "rejected") {
      throw new Error("expected rejection");
    }
    expect(result.requestId).toBeNull();
    expect(result.reason).toBe("page must be a positive integer");
    expect(coordinator.state.result.status).toBe("idle");
  });

  it("never publishes an old generation's completions into the next", () => {
    const coordinator = createQueryCoordinator({
      start: { slice: buildSlice({ search: "yak" }) },
    });
    const generationBefore = coordinator.state.generation;
    const staleRequest = dispatchRequest(coordinator, {
      kind: "setSearch",
      search: "zebu",
    });
    coordinator.reset();
    expect(coordinator.state.generation).toBe(generationBefore + 1);
    // A slow response from the previous generation arrives after the reset.
    expect(
      coordinator.complete(
        staleRequest,
        buildSucceeded([{ id: "old-generation" }]),
      ),
    ).toBe(false);
    expect(coordinator.state.result.rows).toBeNull();
    expect(coordinator.state.slice.search).toBe("yak");

    const fresh = dispatchRequest(coordinator, {
      kind: "navigateWindow",
      page: 2,
    });
    expect(
      coordinator.complete(fresh, buildSucceeded([{ id: "new-generation" }])),
    ).toBe(true);
    expect(coordinator.state.result.rows).toEqual([{ id: "new-generation" }]);
  });

  it("returns to the configured start on reset", () => {
    const coordinator = createQueryCoordinator({
      start: {
        slice: buildSlice({ search: "yak" }),
        window: buildWindow({ size: 25 }),
      },
    });
    coordinator.dispatch({ kind: "setSearch", search: "zebu" });
    coordinator.dispatch({ kind: "navigateWindow", page: 4 });
    coordinator.reset();
    const state = coordinator.state;
    expect(state.slice.search).toBe("yak");
    expect(state.window).toEqual(buildWindow({ size: 25 }));
    expect(state.result.status).toBe("idle");
    expect(state.resultMatchesQuery).toBe(false);
  });

  it("serves a referentially stable snapshot between mutations", () => {
    const coordinator = createQueryCoordinator();
    const first = coordinator.state;
    expect(coordinator.state).toBe(first);
    // No-change and rejected dispatches must not churn the snapshot either.
    coordinator.dispatch({ kind: "navigateWindow", page: 1 });
    expect(coordinator.state).toBe(first);
    coordinator.dispatch({ kind: "navigateWindow", page: 0 });
    expect(coordinator.state).toBe(first);
    coordinator.dispatch({ kind: "navigateWindow", page: 2 });
    expect(coordinator.state).not.toBe(first);
  });

  it("refreshes from an idle state as a pending first request", () => {
    const coordinator = createQueryCoordinator();
    const refreshId = refreshRequest(coordinator);
    // Nothing is on display to refresh: the first page is pending.
    expect(coordinator.state.result.status).toBe("pending");
    expect(coordinator.state.result.rows).toBeNull();
    coordinator.complete(refreshId, buildSucceeded([{ id: "machine-1" }]));
    expect(coordinator.state.result.status).toBe("ready");
  });

  it("names the one request awaiting completion, and only while it waits", () => {
    const coordinator = createQueryCoordinator();
    expect(coordinator.state.pendingRequestId).toBeNull();

    const requestId = refreshRequest(coordinator);
    expect(coordinator.state.pendingRequestId).toBe(requestId);

    coordinator.complete(requestId, buildSucceeded([]));
    expect(coordinator.state.pendingRequestId).toBeNull();
  });

  it("names the superseding request, never the one it replaced", () => {
    const coordinator = createQueryCoordinator();
    const first = coordinator.refresh();
    const second = coordinator.dispatch({
      kind: "navigateWindow",
      page: 2,
    }).requestId;
    expect(second).not.toBe(first);
    expect(coordinator.state.pendingRequestId).toBe(second);
  });

  it("names the adopted request and forgets it on reset", () => {
    const coordinator = createQueryCoordinator();
    const adopted = coordinator.adopt({
      slice: buildSlice({ search: "web" }),
      window: buildWindow(),
    });
    expect(coordinator.state.pendingRequestId).toBe(adopted);
    coordinator.reset();
    expect(coordinator.state.pendingRequestId).toBeNull();
  });

  it("keeps naming no pending request through a failed completion", () => {
    const coordinator = createQueryCoordinator();
    const requestId = refreshRequest(coordinator);
    coordinator.complete(requestId, buildFailed("503"));
    expect(coordinator.state.pendingRequestId).toBeNull();
    expect(coordinator.state.result.problem).toEqual({
      status: "failed",
      failure: { reason: "503", cause: null, transient: null },
    });
  });

  describe("a query withheld for a link's refused clauses", () => {
    const MELTED: QueryIssue = {
      parameter: "status",
      field: "status",
      code: "invalid",
      reason: '"melted" is not an option',
    };
    const SEARCH: QueryIssue = {
      parameter: "q",
      field: null,
      code: "undeclared-field",
      reason: "this source cannot search",
    };

    it("starts withheld, with nothing pending and nothing to refresh", () => {
      const coordinator = createQueryCoordinator({ withheld: [MELTED] });
      const { result, pendingRequestId } = coordinator.state;
      expect(pendingRequestId).toBeNull();
      expect(result.status).toBe("failed");
      expect(result.problem).toEqual({ status: "refused", issues: [MELTED] });
      expect(() => coordinator.refresh()).toThrow(
        "a withheld query is not asked for again",
      );
    });

    it("starts on its query when nothing is withheld", () => {
      const coordinator = createQueryCoordinator({ withheld: [] });
      expect(coordinator.state.result.status).toBe("idle");
    });

    it("withholds an adopted query, so a request in flight never publishes", () => {
      const coordinator = createQueryCoordinator();
      const first = refreshRequest(coordinator);
      coordinator.complete(first, buildSucceeded([{ id: "a" }]));
      const late = refreshRequest(coordinator);
      expect(
        coordinator.adopt({ slice: buildSlice(), window: buildWindow() }, [
          MELTED,
        ]),
      ).toBeNull();
      const { result, pendingRequestId, resultMatchesQuery } =
        coordinator.state;
      expect(pendingRequestId).toBeNull();
      // The rows shown answer no query the reader asked for.
      expect(result.status).toBe("stale");
      expect(result.rows).toEqual([{ id: "a" }]);
      expect(resultMatchesQuery).toBe(false);
      expect(coordinator.complete(late, buildSucceeded([{ id: "b" }]))).toBe(
        false,
      );
      // The same clauses again move nothing.
      const before = coordinator.state;
      expect(
        coordinator.adopt({ slice: buildSlice(), window: buildWindow() }, [
          MELTED,
        ]),
      ).toBeNull();
      expect(coordinator.state).toBe(before);
    });

    it("keeps what is withheld across a move of the window, and drops it with the slice", () => {
      const coordinator = createQueryCoordinator({ withheld: [MELTED] });
      expect(
        coordinator.adopt({
          slice: buildSlice(),
          window: buildWindow({ page: 2 }),
        }),
      ).toBeNull();
      expect(coordinator.state.result.problem?.status).toBe("refused");
      const requestId = coordinator.adopt({
        slice: buildSlice({ search: "al" }),
        window: buildWindow(),
      });
      expect(requestId).not.toBeNull();
      expect(coordinator.state.result.problem).toBeNull();
    });

    it("runs the query once the link names nothing refused", () => {
      const coordinator = createQueryCoordinator({ withheld: [MELTED] });
      const requestId = coordinator.adopt(
        { slice: buildSlice(), window: buildWindow() },
        [],
      );
      expect(requestId).toBe(coordinator.state.pendingRequestId);
      expect(requestId).not.toBeNull();
      // Unwithheld already, the same query again asks for nothing.
      expect(
        coordinator.adopt({ slice: buildSlice(), window: buildWindow() }, []),
      ).toBeNull();
    });

    it("keeps withholding through a command that replaces no refused clause", () => {
      const coordinator = createQueryCoordinator({ withheld: [MELTED] });
      const result = coordinator.dispatch({
        kind: "setSort",
        sort: [{ field: "cpu", direction: "desc" }],
      });
      expect(result.requestId).toBeNull();
      expect(coordinator.state.slice.sort).toEqual([
        { field: "cpu", direction: "desc" },
      ]);
      expect(coordinator.state.result.problem).toEqual({
        status: "refused",
        issues: [MELTED],
      });
      // A command that moves nothing and replaces nothing is no change.
      const before = coordinator.state;
      coordinator.dispatch({ kind: "setGroup", group: [] });
      expect(coordinator.state).toBe(before);
    });

    it("replaces a refused clause through a command on its field, moving the query or not", () => {
      const coordinator = createQueryCoordinator({
        withheld: [MELTED, SEARCH],
      });
      // Nothing to remove from the slice, and still the clause is gone.
      expect(
        coordinator.dispatch({
          kind: "removePredicate",
          field: "status",
          operator: "isAny",
        }).requestId,
      ).toBeNull();
      expect(coordinator.state.result.problem).toEqual({
        status: "refused",
        issues: [SEARCH],
      });
      const requestId = dispatchRequest(coordinator, {
        kind: "setSearch",
        search: "",
      });
      expect(coordinator.state.pendingRequestId).toBe(requestId);
    });

    it("replaces a refused clause with a predicate set on its field", () => {
      const coordinator = createQueryCoordinator({ withheld: [MELTED] });
      dispatchRequest(coordinator, {
        kind: "setPredicate",
        predicate: buildStatusPredicate("failed"),
      });
      expect(coordinator.state.slice.filter).toEqual([
        buildStatusPredicate("failed"),
      ]);
    });

    it("withholds nothing after a reset", () => {
      const coordinator = createQueryCoordinator({ withheld: [MELTED] });
      coordinator.reset();
      expect(coordinator.state.result.problem).toBeNull();
      expect(refreshRequest(coordinator)).toBe(
        coordinator.state.pendingRequestId,
      );
    });
  });

  it("withdraws every row, count and facet a forbidden request was shown", () => {
    const coordinator = createQueryCoordinator();
    coordinator.complete(
      refreshRequest(coordinator),
      buildSucceeded([{ id: "a" }], {
        facets: { status: { kind: "values", values: [] } },
      }),
    );
    const cause = new Error("403");
    expect(
      coordinator.complete(refreshRequest(coordinator), {
        status: "forbidden",
        cause,
      }),
    ).toBe(true);
    const { result, resultMatchesQuery } = coordinator.state;
    expect(result).toMatchObject({
      status: "failed",
      rows: null,
      counts: null,
      facets: null,
      provenance: null,
      problem: { status: "forbidden", cause },
    });
    expect(resultMatchesQuery).toBe(false);
    // A late success for an earlier request does not bring the rows back.
    expect(coordinator.complete("i0:r0", buildSucceeded([{ id: "a" }]))).toBe(
      false,
    );
  });
});
