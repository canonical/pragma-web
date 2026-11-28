import { describe, expect, it } from "vitest";
import { CHART_FACETS, MOCK_API_ORIGIN } from "./constants.js";

describe("constants", () => {
  it("names the status and the cores", () => {
    expect(CHART_FACETS).toEqual(["status", "cores"]);
  });

  it("addresses the mock API on the local host", () => {
    expect(MOCK_API_ORIGIN).toBe("http://localhost");
  });
});
