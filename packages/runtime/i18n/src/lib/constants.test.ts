import { describe, expect, it } from "vitest";
import { COOKIE_MAX_AGE, DEFAULT_COOKIE_NAME } from "./constants.js";

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
