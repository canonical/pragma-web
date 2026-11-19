import { describe, expect, it } from "vitest";
import {
  CHART_FACETS,
  DELIVERY_WAIT,
  FILE_RULE_ALLOWLIST,
  MOCK_API_ORIGIN,
} from "./constants.js";

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

  it("lists each owed file-rule finding once, frozen", () => {
    expect(new Set(FILE_RULE_ALLOWLIST).size).toBe(FILE_RULE_ALLOWLIST.length);
    expect(Object.isFrozen(FILE_RULE_ALLOWLIST)).toBe(true);
  });
});
