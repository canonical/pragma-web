import { describe, expect, it } from "vitest";
import assertSiteKey from "./assertSiteKey.js";

describe("assertSiteKey", () => {
  it("returns the key the slot holds for the type", () => {
    const key = { " $fragmentSpreads": "StationCard_node" };
    expect(assertSiteKey(key, "Station")).toBe(key);
  });

  it("names the type of a key the slot left null", () => {
    expect(() => assertSiteKey(null, "Line")).toThrow(
      "the site slot holds no Line data for this node",
    );
  });

  it("names the type of a key the slot did not hold", () => {
    expect(() => assertSiteKey(undefined, "Zone")).toThrow("no Zone data");
  });
});
