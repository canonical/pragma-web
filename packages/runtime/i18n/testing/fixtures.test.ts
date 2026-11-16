import { describe, expect, it } from "vitest";
import type { I18nConfig } from "../src/lib/index.js";
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

  it.each(configs)("%s lists each locale once", (_, config) => {
    expect(new Set(config.locales).size).toBe(config.locales.length);
  });
});

describe("translatorCatalog", () => {
  it("holds plain, interpolated and plural entries", () => {
    expect(fixtures.translatorCatalog["nav.home"]).toBe("Home");
    expect(fixtures.translatorCatalog.greeting).toContain("{name}");
    expect(fixtures.translatorCatalog.items).toEqual({
      one: "{count} item",
      other: "{count} items",
    });
  });

  it("gives the Arabic plural entry all six categories", () => {
    expect(Object.keys(fixtures.translatorCatalog.arItems ?? {})).toEqual([
      "zero",
      "one",
      "two",
      "few",
      "many",
      "other",
    ]);
  });
});

describe("baseCatalog", () => {
  it("holds two plain entries for overrides to layer onto", () => {
    expect(fixtures.baseCatalog).toEqual({ a: "base-a", b: "base-b" });
  });
});

describe("effectsOff", () => {
  it("turns off both browser effects", () => {
    expect(fixtures.effectsOff).toEqual({ persist: false, reflect: false });
  });
});

describe("arabicItemForms", () => {
  it("words every cardinal category Arabic uses", () => {
    const categories = new Intl.PluralRules("ar").resolvedOptions()
      .pluralCategories;
    for (const category of categories) {
      expect(fixtures.arabicItemForms[category]).toBeTypeOf("string");
    }
  });
});
