import { describe, expect, it } from "vitest";
import { negotiationConfig as config } from "../../testing/fixtures.js";
import isSupportedLocale from "./isSupportedLocale.js";

describe("isSupportedLocale", () => {
  it("accepts a configured locale", () => {
    expect(isSupportedLocale(config, "fr")).toBe(true);
  });

  it("rejects an unconfigured locale", () => {
    expect(isSupportedLocale(config, "de")).toBe(false);
  });

  it("rejects null and undefined", () => {
    expect(isSupportedLocale(config, null)).toBe(false);
    expect(isSupportedLocale(config, undefined)).toBe(false);
  });
});
