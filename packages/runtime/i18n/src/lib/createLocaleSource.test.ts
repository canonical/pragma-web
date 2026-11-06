import { describe, expect, it } from "vitest";
import { effectsOff, localeConfig } from "../../testing/fixtures.js";
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
      source.set("fr");
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

    it("persists and reflects the locale it sets", () => {
      runWithDocument((page) => {
        const source = createLocaleSource(localeConfig);
        source.set("fr");
        expect(page.documentElement).toEqual({ lang: "fr", dir: "ltr" });
        expect(page.cookie).toBe(
          "locale=fr; path=/; max-age=31536000; SameSite=Lax",
        );
      });
    });

    it("writes nothing to the document for the current locale", () => {
      runWithDocument((page) => {
        const source = createLocaleSource(localeConfig, { initial: "fr" });
        source.set("fr");
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
  });
});
