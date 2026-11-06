/**
 * The shared fixtures every suite builds from: each one means what its name
 * says, so a suite that reads one is not misled by it.
 */
import { describe, expect, it } from "vitest";
import {
  answering,
  atLeast,
  BY_NUMBER,
  buildSettledPage,
  buildStoredView,
  byId,
  declare,
  declareSort,
  displayStatusOf,
  exactly,
  FACETED_ROWS,
  FACETED_SCHEMA,
  FORWARD_CURSORS,
  failedWith,
  filterStatusBy,
  NOTHING_DECLARED,
  pageOf,
  readIssuedRequest,
  refusedWith,
} from "./fixtures.js";

describe("byId", () => {
  it("reads a record's own id as text", () => {
    expect(byId({ id: 7 })).toBe("7");
  });
});

describe("NOTHING_DECLARED", () => {
  it("can filter, search and sort by nothing", () => {
    expect(NOTHING_DECLARED.filter).toEqual({});
    expect(NOTHING_DECLARED.search).toBeNull();
    expect(NOTHING_DECLARED.sort.fields).toEqual([]);
  });
});

describe("declare", () => {
  it("overrides the members it is given and keeps the rest declaring nothing", () => {
    const declared = declare({ filter: { status: ["isAny"] } });
    expect(declared.filter).toEqual({ status: ["isAny"] });
    expect(declared.sort).toBe(NOTHING_DECLARED.sort);
  });
});

describe("declareSort", () => {
  it("orders by the given fields, unlimited unless a term limit is given", () => {
    expect(declareSort(["cpu"])).toMatchObject({
      fields: ["cpu"],
      terms: null,
    });
    expect(declareSort(["cpu"], 2).terms).toBe(2);
  });
});

describe("pageOf", () => {
  it("is a complete page of the rows, counted exactly", () => {
    const page = pageOf([{ id: "a" }, { id: "b" }]);
    expect(page.rows).toHaveLength(2);
    expect(page.counts.matched).toEqual({ kind: "exact", value: 2 });
    expect(page.counts.pageable).toEqual({ kind: "exact", value: 2 });
    expect(page.cursors).toBeNull();
  });
});

describe("answering", () => {
  it("answers every request with a page of the rows", () => {
    const answer = answering([{ id: "a" }]);
    expect(
      answer({
        requestId: "r",
        slice: { filter: [], search: null, sort: [], group: [] },
        window: { page: 1, size: 25, cursor: null, collapsed: [] },
        facets: [],
      }).rows,
    ).toEqual([{ id: "a" }]);
  });
});

describe("failedWith", () => {
  it("fails with the reason, raised as an error", () => {
    const failed = failedWith("offline");
    expect(failed.failure.reason).toBe("offline");
    expect(failed.failure.cause).toEqual(new Error("offline"));
  });
});

describe("refusedWith", () => {
  it("refuses the sort once for each reason", () => {
    expect(refusedWith("a", "b").refusals.map(({ reason }) => reason)).toEqual([
      "a",
      "b",
    ]);
  });
});

describe("exactly and atLeast", () => {
  it("count exactly, or as a lower bound", () => {
    expect(exactly(3)).toEqual({ kind: "exact", value: 3 });
    expect(atLeast(3)).toEqual({ kind: "at-least", value: 3 });
  });
});

describe("BY_NUMBER and FORWARD_CURSORS", () => {
  it("reach pages by number, or forward by token alone", () => {
    expect(BY_NUMBER).toEqual({ kind: "offset" });
    expect(FORWARD_CURSORS).toEqual({
      kind: "cursor",
      backward: false,
      durable: false,
    });
  });
});

describe("buildSettledPage", () => {
  it("is a page of that many identities, counting only what it is told", () => {
    const page = buildSettledPage({ rows: 2, pageable: exactly(9) });
    expect(page.rows).toEqual([{ id: "m0" }, { id: "m1" }]);
    expect(page.counts.pageable).toEqual(exactly(9));
    expect(page.counts.matched).toEqual({ kind: "unknown" });
    expect(page.more).toBeNull();
  });
});

describe("readIssuedRequest", () => {
  it("reads an issued request, and fails loudly when none was", () => {
    expect(readIssuedRequest("r-1")).toBe("r-1");
    expect(() => readIssuedRequest(null)).toThrow(
      "expected the command to issue a request",
    );
  });
});

describe("filterStatusBy", () => {
  it("filters the status to the operands and nothing else", () => {
    expect(filterStatusBy(["failed"]).filter).toEqual([
      { field: "status", operator: "isAny", operands: ["failed"] },
    ]);
  });
});

describe("displayStatusOf", () => {
  it("gives a reason to the statuses that carry one", () => {
    expect(displayStatusOf("stale")).toEqual({
      status: "stale",
      reason: "offline",
    });
    expect(displayStatusOf("no-data")).toEqual({ status: "no-data" });
  });
});

describe("buildStoredView", () => {
  it("is one stored view, with the given fields changed", () => {
    expect(buildStoredView({ name: "Mine" })).toMatchObject({
      id: "v1",
      name: "Mine",
      query: "status=failed",
    });
  });
});

describe("FACETED_SCHEMA and FACETED_ROWS", () => {
  it("hold a field of every kind, and records meeting each one every way", () => {
    expect(FACETED_SCHEMA.fieldNames).toEqual([
      "status",
      "cpu",
      "owner",
      "updated",
      "name",
    ]);
    expect(new Set(FACETED_ROWS.map(byId)).size).toBe(FACETED_ROWS.length);
  });
});
