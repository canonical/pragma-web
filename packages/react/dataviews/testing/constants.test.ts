import { describe, expect, it } from "vitest";
import { CHART_FACETS, DELIVERY_WAIT, MOCK_API_ORIGIN } from "./constants.js";

describe("constants", () => {
  it("polls often, within a test's own timeout", () => {
    expect(DELIVERY_WAIT.interval).toBeLessThan(DELIVERY_WAIT.timeout);
    expect(DELIVERY_WAIT.timeout).toBeLessThanOrEqual(5000);
  });

  it("names the status and the cores", () => {
    expect(CHART_FACETS).toEqual(["status", "cores"]);
  });

  it("addresses the mock API on the local host", () => {
    expect(MOCK_API_ORIGIN).toBe("http://localhost");
  });
});
