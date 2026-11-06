/**
 * The shared fixtures every suite builds from: each one means what its name
 * says, and the tables are complete, so a suite that reads one is not misled.
 */
import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import {
  buildStoredView,
  COUNTED_EXACTLY,
  countExactly,
  deliverRows,
  displayStatusOf,
  FACET_CASES,
  FACET_RECORDS,
  FACETED_FILTER_STORIES,
  MESSAGE_MARK,
  MESSAGE_SAMPLES,
  OPERATOR_CASES,
  OPERATOR_RECORDS,
  pageOf,
  SERVER_RENDER_HREF,
} from "./fixtures.js";

describe("COUNTED_EXACTLY and countExactly", () => {
  it("count exactly", () => {
    expect(COUNTED_EXACTLY.matched).toBe("exact");
    expect(countExactly(3)).toEqual({ kind: "exact", value: 3 });
  });
});

describe("pageOf and deliverRows", () => {
  it("are a complete page of the rows, counted exactly, and its delivery", () => {
    const rows = [{ id: "a" }, { id: "b" }];
    expect(pageOf(rows).counts.matched).toEqual(countExactly(2));
    expect(deliverRows(rows)).toEqual({
      status: "succeeded",
      page: pageOf(rows),
    });
  });
});

describe("displayStatusOf", () => {
  it("gives a reason to the statuses that carry one", () => {
    expect(displayStatusOf("failed")).toEqual({
      status: "failed",
      reason: "offline",
    });
    expect(displayStatusOf("pending")).toEqual({ status: "pending" });
  });
});

describe("buildStoredView", () => {
  it("is one stored view, with the given fields changed", () => {
    expect(buildStoredView({ pinned: true })).toMatchObject({
      id: "v1",
      pinned: true,
    });
  });
});

describe("SERVER_RENDER_HREF", () => {
  it("is a location carrying a filter, a sort and a window", () => {
    const params = new URL(SERVER_RENDER_HREF, "https://example.com")
      .searchParams;
    expect([...params.keys()]).toEqual(["status", "sort", "page", "size"]);
  });
});

describe("FACETED_FILTER_STORIES", () => {
  it("names the Filters stories that draw facets", () => {
    expect([...FACETED_FILTER_STORIES]).toContain("CountsBesideOptions");
  });
});

describe("the operator and facet tables", () => {
  it("each look through records of distinct identity", () => {
    for (const records of [OPERATOR_RECORDS, FACET_RECORDS]) {
      expect(new Set(records.map(({ id }) => id)).size).toBe(records.length);
    }
    expect(OPERATOR_CASES.length).toBeGreaterThan(0);
    expect(FACET_CASES.length).toBeGreaterThan(0);
  });
});

/** The English record every sample is checked against. */
const ENGLISH = resolveMessages();

describe("MESSAGE_SAMPLES", () => {
  it("has samples for every message, and arguments only for worded ones", () => {
    expect(Object.keys(MESSAGE_SAMPLES).sort()).toEqual(
      Object.keys(ENGLISH).sort(),
    );
    for (const [key, samples] of Object.entries(MESSAGE_SAMPLES)) {
      const message = ENGLISH[key as keyof typeof ENGLISH];
      expect(samples === null).toBe(typeof message === "string");
    }
  });

  it("marks what a message is handed with a character no message says", () => {
    expect(JSON.stringify(ENGLISH)).not.toContain(MESSAGE_MARK);
  });
});
