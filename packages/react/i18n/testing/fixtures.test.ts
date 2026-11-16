import type { I18nConfig } from "@canonical/i18n-core";
import { describe, expect, it } from "vitest";
import * as fixtures from "./fixtures.js";

/** Every exported fixture that is a locale configuration. */
const configs = Object.entries(fixtures).filter(
  (entry): entry is [string, I18nConfig] => {
    const [, value] = entry;
    return typeof value === "object" && "locales" in value;
  },
);

describe("locale configs", () => {
  it.each(configs)("%s names a configured default locale", (_, config) => {
    expect(config.locales).toContain(config.defaultLocale);
  });
});

describe("greetingCatalogs", () => {
  it("greets in English and French, with no Arabic catalog", () => {
    expect(Object.keys(fixtures.greetingCatalogs)).toEqual(["en", "fr"]);
    expect(fixtures.greetingCatalogs.en?.greeting).toBe("Hello, {name}!");
  });
});

describe("emptyCatalogs", () => {
  it("has no catalog", () => {
    expect(fixtures.emptyCatalogs).toEqual({});
  });
});

describe("effectsOff", () => {
  it("turns off both browser effects", () => {
    expect(fixtures.effectsOff).toEqual({ persist: false, reflect: false });
  });
});
