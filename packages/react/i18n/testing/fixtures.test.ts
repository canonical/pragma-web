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

describe("nameLabels", () => {
  it("words the label in every configured locale", () => {
    expect(Object.keys(fixtures.nameLabels)).toEqual(
      fixtures.localeConfig.locales,
    );
  });
});

describe("greetings", () => {
  it("words each message in English and French", () => {
    expect(fixtures.greetings.en.heading).toBe("Welcome");
    expect(fixtures.greetings.en.greeting("Ada")).toBe(
      "Hello, \u2068Ada\u2069!",
    );
    expect(fixtures.greetings.en.items(1)).toBe("1 item");
    expect(fixtures.greetings.fr.heading).toBe("Bienvenue");
    expect(fixtures.greetings.fr.greeting("Ada")).toBe(
      "Bonjour, \u2068Ada\u2069 !",
    );
    expect(fixtures.greetings.fr.items(1_000_000)).toBe(
      "1\u202f000\u202f000 d’articles",
    );
  });

  it("has no Arabic entry, on purpose", () => {
    expect(Object.keys(fixtures.greetings)).toEqual(["en", "fr"]);
  });
});

describe("rows", () => {
  it("words the selection in English and French", () => {
    expect(fixtures.rows.en.rowsSelected(2)).toBe("2 rows selected");
    expect(fixtures.rows.fr.rowsSelected(1)).toBe("1 ligne sélectionnée");
  });

  it("has no Arabic entry, on purpose", () => {
    expect(Object.keys(fixtures.rows)).toEqual(["en", "fr"]);
  });
});
