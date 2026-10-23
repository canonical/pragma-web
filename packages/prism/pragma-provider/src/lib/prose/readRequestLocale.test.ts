import { describe, expect, it } from "vitest";
import { readRequestLocale } from "./readRequestLocale.js";

/** A request carrying `headers`. */
const requestWith = (headers: Record<string, string>): Request =>
  new Request("http://localhost/graphql", { headers });

describe("readRequestLocale", () => {
  it("reads the language the x-prism-locale header names", () => {
    expect(readRequestLocale(requestWith({ "x-prism-locale": "fr" }))).toBe(
      "fr",
    );
    expect(readRequestLocale(requestWith({ "X-Prism-Locale": "pt-BR" }))).toBe(
      "pt-BR",
    );
  });

  it("is undefined without the header", () => {
    expect(readRequestLocale(requestWith({}))).toBeUndefined();
  });

  it("ignores Accept-Language, which the browser sends on its own", () => {
    expect(
      readRequestLocale(requestWith({ "accept-language": "fr" })),
    ).toBeUndefined();
  });

  it("treats a value that is not a language tag as no header", () => {
    for (const value of ["FR", "fr_FR", "fr, en", "", "french"]) {
      expect(
        readRequestLocale(requestWith({ "x-prism-locale": value })),
      ).toBeUndefined();
    }
  });
});
