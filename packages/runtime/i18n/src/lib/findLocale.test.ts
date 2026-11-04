import { describe, expect, it } from "vitest";
import { regionalOnlyConfig as config } from "../../testing/fixtures.js";
import findLocale from "./findLocale.js";

describe("findLocale", () => {
  it("returns the configured tag that matches exactly", () => {
    expect(findLocale(config, "en")).toBe("en");
  });

  it("matches case-insensitively and returns the configured casing", () => {
    expect(findLocale(config, "FR-ca")).toBe("fr-CA");
  });

  it("does not fall back to a base language", () => {
    expect(findLocale(config, "en-GB")).toBeUndefined();
  });

  it("returns undefined for an absent value", () => {
    expect(findLocale(config, undefined)).toBeUndefined();
  });
});
