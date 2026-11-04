import { describe, expect, it } from "vitest";
import {
  baseAndRegionalConfig,
  effectsOff,
  localeConfig,
  regionalOnlyConfig,
} from "../../testing/fixtures.js";
import runWithDocument from "../../testing/runWithDocument.js";
import createLocaleSource from "./createLocaleSource.js";

describe("createLocaleSource", () => {
  it("starts at the default locale", () => {
    const source = createLocaleSource(localeConfig);
    expect(source.get()).toBe("en");
    expect(source.direction).toBe("ltr");
  });

  it("honors an explicit initial locale and its direction", () => {
    const source = createLocaleSource(localeConfig, { initial: "ar" });
    expect(source.get()).toBe("ar");
    expect(source.direction).toBe("rtl");
  });

  it("stores an initial locale as given, without matching it", () => {
    const source = createLocaleSource(localeConfig, {
      ...effectsOff,
      initial: "fr-CA",
    });
    expect(source.get()).toBe("fr-CA");
  });

  it("reflects the initial locale and its direction in the browser", () => {
    runWithDocument((page) => {
      createLocaleSource(localeConfig, { initial: "ar" });
      expect(page.documentElement).toEqual({ lang: "ar", dir: "rtl" });
      expect(page.cookie).toBe("");
    });
  });

  it("writes nothing to the document when persist and reflect are off", () => {
    runWithDocument((page) => {
      const source = createLocaleSource(localeConfig, effectsOff);
      source.set("fr-CA");
      expect(source.get()).toBe("fr");
      expect(page).toEqual({
        cookie: "",
        documentElement: { lang: "", dir: "" },
      });
    });
  });

  describe("subscribe", () => {
    it("notifies immediately and on change, and unsubscribes", () => {
      const source = createLocaleSource(localeConfig, effectsOff);
      const seen: string[] = [];
      const unsubscribe = source.subscribe((locale) => seen.push(locale));

      source.set("fr");
      source.set("fr"); // no-op: same value
      unsubscribe();
      source.set("ar"); // ignored after unsubscribe

      expect(seen).toEqual(["en", "fr"]);
    });
  });

  describe("set", () => {
    it("updates the value and the direction", () => {
      const source = createLocaleSource(localeConfig, effectsOff);
      source.set("ar");
      expect(source.get()).toBe("ar");
      expect(source.direction).toBe("rtl");
    });

    it("is inert on the server with persist and reflect on", () => {
      const source = createLocaleSource(localeConfig);
      expect(() => source.set("fr")).not.toThrow();
      expect(source.get()).toBe("fr");
    });

    it("persists the locale under a configured cookie name", () => {
      runWithDocument((page) => {
        const source = createLocaleSource({
          ...localeConfig,
          cookieName: "lang",
        });
        source.set("fr");
        expect(page.cookie).toBe(
          "lang=fr; path=/; max-age=31536000; SameSite=Lax",
        );
      });
    });

    it("matches a regional tag to its configured base language", () => {
      const source = createLocaleSource(localeConfig, effectsOff);
      const seen: string[] = [];
      source.subscribe((locale) => seen.push(locale));
      source.set("fr-CA");
      expect(source.get()).toBe("fr");
      expect(seen).toEqual(["en", "fr"]);
    });

    it("matches case-insensitively and stores the configured casing", () => {
      const cased = createLocaleSource(regionalOnlyConfig, effectsOff);
      cased.set("FR-ca");
      expect(cased.get()).toBe("fr-CA");
      const source = createLocaleSource(localeConfig, effectsOff);
      source.set("AR");
      expect(source.get()).toBe("ar");
      expect(source.direction).toBe("rtl");
    });

    it("prefers an exact configured tag over its base language", () => {
      const both = createLocaleSource(baseAndRegionalConfig, effectsOff);
      both.set("fr-CA");
      expect(both.get()).toBe("fr-CA");
    });

    it("does not notify when the tag matches the current locale", () => {
      const source = createLocaleSource(localeConfig, {
        ...effectsOff,
        initial: "fr",
      });
      const seen: string[] = [];
      source.subscribe((locale) => seen.push(locale));
      source.set("fr-BE");
      source.set("FR");
      expect(seen).toEqual(["fr"]);
    });

    it("throws a RangeError for a tag that matches no configured locale", () => {
      const source = createLocaleSource(localeConfig, effectsOff);
      expect(() => source.set("de-DE")).toThrow(
        new RangeError(
          'The locale "de-DE" matches none of the configured locales: en, fr, ar.',
        ),
      );
    });

    it("keeps the current locale when the tag is refused", () => {
      const source = createLocaleSource(localeConfig, {
        ...effectsOff,
        initial: "ar",
      });
      const seen: string[] = [];
      source.subscribe((locale) => seen.push(locale));
      expect(() => source.set("de")).toThrow(RangeError);
      expect(source.get()).toBe("ar");
      expect(seen).toEqual(["ar"]);
    });

    it("persists and reflects the matched locale, not the requested tag", () => {
      runWithDocument((page) => {
        const source = createLocaleSource(localeConfig);
        source.set("fr-CA");
        expect(page.documentElement).toEqual({ lang: "fr", dir: "ltr" });
        expect(page.cookie).toBe(
          "locale=fr; path=/; max-age=31536000; SameSite=Lax",
        );
      });
    });

    it("writes nothing to the document when it refuses a tag", () => {
      runWithDocument((page) => {
        const source = createLocaleSource(localeConfig);
        expect(() => source.set("de")).toThrow(RangeError);
        expect(page.cookie).toBe("");
        expect(page.documentElement).toEqual({ lang: "en", dir: "ltr" });
      });
    });

    it("writes nothing to the document for a tag of the current locale", () => {
      runWithDocument((page) => {
        const source = createLocaleSource(localeConfig, { initial: "fr" });
        source.set("FR");
        source.set("fr-BE");
        expect(page.cookie).toBe("");
        expect(page.documentElement).toEqual({ lang: "fr", dir: "ltr" });
      });
    });

    it("reflects but does not persist when persist is off", () => {
      runWithDocument((page) => {
        const source = createLocaleSource(localeConfig, { persist: false });
        source.set("ar");
        expect(page.cookie).toBe("");
        expect(page.documentElement).toEqual({ lang: "ar", dir: "rtl" });
      });
    });

    it("persists but does not reflect when reflect is off", () => {
      runWithDocument((page) => {
        const source = createLocaleSource(localeConfig, { reflect: false });
        source.set("ar");
        expect(page.cookie).toBe(
          "locale=ar; path=/; max-age=31536000; SameSite=Lax",
        );
        expect(page.documentElement).toEqual({ lang: "", dir: "" });
      });
    });

    it("does not match a base language to a regional configured tag", () => {
      const regional = createLocaleSource(regionalOnlyConfig, effectsOff);
      expect(() => regional.set("fr")).toThrow(RangeError);
    });
  });
});
