import { describe, expect, it } from "vitest";
import { mixedRegionConfig as config } from "../../testing/fixtures.js";
import matchLocale from "./matchLocale.js";

describe("matchLocale", () => {
  it("returns an exact configured tag", () => {
    expect(matchLocale(config, "pt-BR")).toBe("pt-BR");
  });

  it("falls back to the configured base language of a regional tag", () => {
    expect(matchLocale(config, "fr-CA")).toBe("fr");
  });

  it("matches case-insensitively and returns the configured casing", () => {
    expect(matchLocale(config, "PT-br")).toBe("pt-BR");
    expect(matchLocale(config, "FR")).toBe("fr");
  });

  it("does not match a base language to a regional configured tag", () => {
    expect(matchLocale(config, "pt")).toBeUndefined();
  });

  it("returns undefined for a tag that matches nothing", () => {
    expect(matchLocale(config, "de-DE")).toBeUndefined();
  });
});
