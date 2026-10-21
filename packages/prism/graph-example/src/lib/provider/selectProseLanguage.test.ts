import { describe, expect, it } from "vitest";
import { selectProseLanguage } from "./selectProseLanguage.js";

const TEXTS = { en: "English", fr: "Français", "pt-BR": "Português" };

describe("selectProseLanguage", () => {
  it("serves the first authored preference", () => {
    expect(selectProseLanguage(TEXTS, ["fr", "pt-BR"])).toBe("fr");
  });

  it("skips preferences that are absent or not authored", () => {
    expect(selectProseLanguage(TEXTS, [undefined, "de", "pt-BR"])).toBe(
      "pt-BR",
    );
  });

  it("falls back to the default language", () => {
    expect(selectProseLanguage(TEXTS, ["de"])).toBe("en");
    expect(selectProseLanguage(TEXTS, [])).toBe("en");
  });

  it("matches a language exactly, with no subtag fallback", () => {
    expect(selectProseLanguage(TEXTS, ["fr-CA", "pt"])).toBe("en");
  });

  it("does not read inherited properties as languages", () => {
    expect(selectProseLanguage(TEXTS, ["constructor", "toString"])).toBe("en");
  });
});
