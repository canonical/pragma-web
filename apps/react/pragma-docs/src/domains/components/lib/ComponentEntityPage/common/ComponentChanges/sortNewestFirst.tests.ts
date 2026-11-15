import { describe, expect, it } from "vitest";
import sortNewestFirst from "./sortNewestFirst.js";

describe("sortNewestFirst", () => {
  it("puts the newest entry first", () => {
    const entries = [
      { id: "old", timestamp: "2026-02-20T00:00:00.000+01:00" },
      { id: "new", timestamp: "2026-03-06T11:00:00.000+01:00" },
    ];
    expect(sortNewestFirst(entries).map(({ id }) => id)).toEqual([
      "new",
      "old",
    ]);
  });

  it("compares the instants, not the written offsets", () => {
    const entries = [
      { id: "earlier", timestamp: "2026-03-06T10:00:00.000+00:00" },
      { id: "later", timestamp: "2026-03-06T10:30:00.000+01:00" },
    ];
    expect(sortNewestFirst(entries).map(({ id }) => id)).toEqual([
      "earlier",
      "later",
    ]);
  });

  it("puts entries without a readable date after the dated ones, in their order", () => {
    const entries = [
      { id: "none" },
      { id: "dated", timestamp: "2026-01-01T00:00:00.000Z" },
      { id: "null", timestamp: null },
      { id: "junk", timestamp: "soon" },
    ];
    expect(sortNewestFirst(entries).map(({ id }) => id)).toEqual([
      "dated",
      "none",
      "null",
      "junk",
    ]);
  });

  it("keeps the given order of entries of one instant and leaves its input whole", () => {
    const entries = [
      { id: "a", timestamp: "2026-01-01T00:00:00.000Z" },
      { id: "b", timestamp: "2026-01-01T00:00:00.000Z" },
    ];
    expect(sortNewestFirst(entries).map(({ id }) => id)).toEqual(["a", "b"]);
    expect(entries.map(({ id }) => id)).toEqual(["a", "b"]);
  });
});
