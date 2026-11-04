import { describe, expect, expectTypeOf, it } from "vitest";
import {
  COOKIE_MAX_AGE,
  DEFAULT_COOKIE_NAME,
  PLURAL_CATEGORIES,
} from "./constants.js";
import type { PluralCategory } from "./types.js";

describe("DEFAULT_COOKIE_NAME", () => {
  it("names the cookie that persists a locale choice", () => {
    expect(DEFAULT_COOKIE_NAME).toBe("locale");
  });
});

describe("COOKIE_MAX_AGE", () => {
  it("keeps the cookie for one year, in seconds", () => {
    expect(COOKIE_MAX_AGE).toBe(365 * 24 * 60 * 60);
  });
});

describe("PLURAL_CATEGORIES", () => {
  it("lists exactly the PluralCategory type's members", () => {
    expectTypeOf<
      (typeof PLURAL_CATEGORIES)[number]
    >().toEqualTypeOf<PluralCategory>();
  });

  it("lists every CLDR plural category in CLDR order", () => {
    expect(PLURAL_CATEGORIES).toEqual([
      "zero",
      "one",
      "two",
      "few",
      "many",
      "other",
    ]);
  });
});
