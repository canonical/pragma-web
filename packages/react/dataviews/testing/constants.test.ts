import { describe, expect, it } from "vitest";
import { CHART_FACETS, DELIVERY_WAIT } from "./constants.js";

describe("DELIVERY_WAIT", () => {
  it("polls often, within a test's own timeout", () => {
    expect(DELIVERY_WAIT.interval).toBeLessThan(DELIVERY_WAIT.timeout);
    expect(DELIVERY_WAIT.timeout).toBeLessThanOrEqual(5000);
  });
});

describe("CHART_FACETS", () => {
  it("names the status and the cores", () => {
    expect(CHART_FACETS).toEqual(["status", "cores"]);
  });
});
