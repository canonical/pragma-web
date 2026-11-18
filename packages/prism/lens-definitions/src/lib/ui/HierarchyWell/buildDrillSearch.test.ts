import { describe, expect, it } from "vitest";
import buildDrillSearch from "./buildDrillSearch.js";

describe("buildDrillSearch", () => {
  it("sets or drops expand and keeps every other view key", () => {
    const current = new URLSearchParams("q=x&sheet=filter&expand=ds");
    expect(buildDrillSearch(current, "surface")).toEqual({
      q: "x",
      sheet: "filter",
      expand: "surface",
    });
    expect(buildDrillSearch(current, undefined)).toEqual({
      q: "x",
      sheet: "filter",
    });
    expect(buildDrillSearch(new URLSearchParams(), "cs")).toEqual({
      expand: "cs",
    });
  });

  it("keeps a repeated key whole, each value in order", () => {
    const current = new URLSearchParams("tag=a&q=x&tag=b&expand=ds");
    expect(buildDrillSearch(current, "cs")).toEqual({
      tag: ["a", "b"],
      q: "x",
      expand: "cs",
    });
    expect(buildDrillSearch(current, undefined)).toEqual({
      tag: ["a", "b"],
      q: "x",
    });
  });
});
