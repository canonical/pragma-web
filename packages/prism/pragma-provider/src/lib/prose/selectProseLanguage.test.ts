import { describe, expect, it } from "vitest";
import { selectProseLanguage } from "./selectProseLanguage.js";
import type { ProseDocument } from "./types.js";

const DOCUMENT: ProseDocument = {
  texts: { en: "English", fr: "Français", "pt-BR": "Português" },
  availableLanguages: ["en", "fr", "pt-BR"],
  references: [],
};

describe("selectProseLanguage", () => {
  it("serves the first authored preference", () => {
    expect(selectProseLanguage(DOCUMENT, ["fr", "pt-BR"])).toBe("fr");
  });

  it("skips preferences that are absent or not authored", () => {
    expect(selectProseLanguage(DOCUMENT, [undefined, "de", "pt-BR"])).toBe(
      "pt-BR",
    );
  });

  it("falls back to the default language", () => {
    expect(selectProseLanguage(DOCUMENT, ["de"])).toBe("en");
    expect(selectProseLanguage(DOCUMENT, [])).toBe("en");
  });

  it("matches a language exactly, with no subtag fallback", () => {
    expect(selectProseLanguage(DOCUMENT, ["fr-CA", "pt"])).toBe("en");
  });

  it("does not read inherited properties as languages", () => {
    expect(selectProseLanguage(DOCUMENT, ["constructor", "toString"])).toBe(
      "en",
    );
  });
});
