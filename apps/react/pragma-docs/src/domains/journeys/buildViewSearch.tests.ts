import { describe, expect, it } from "vitest";
import buildViewSearch from "./buildViewSearch.js";

describe("buildViewSearch", () => {
  it("carries the graph view in the link's search", () => {
    expect(buildViewSearch("graph")).toEqual({ view: "graph" });
  });

  it("carries nothing for the table, the default", () => {
    expect(buildViewSearch("table")).toBeUndefined();
  });
});
