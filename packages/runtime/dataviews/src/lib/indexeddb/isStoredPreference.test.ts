import { describe, expect, it } from "vitest";
import isStoredPreference from "./isStoredPreference.js";

const preference = { scope: "machines", target: "default", key: "k" };

describe("isStoredPreference", () => {
  it("reads a record holding any JSON value", () => {
    for (const value of ["text", true, 4, null, [1, "a"], { a: { b: [] } }]) {
      expect(isStoredPreference({ ...preference, value })).toBe(true);
    }
  });

  it("refuses a value that is not JSON", () => {
    for (const value of [
      Number.NaN,
      Number.POSITIVE_INFINITY,
      undefined,
      () => {},
      [1, undefined],
      { a: Number.NaN },
      new Date(0),
      Object.create(null),
    ]) {
      expect(isStoredPreference({ ...preference, value })).toBe(false);
    }
  });

  it("refuses a record missing a string scope, target or key", () => {
    expect(isStoredPreference({ ...preference, scope: 1, value: 1 })).toBe(
      false,
    );
    expect(isStoredPreference({ ...preference, target: 1, value: 1 })).toBe(
      false,
    );
    expect(isStoredPreference({ ...preference, key: 1, value: 1 })).toBe(false);
  });

  it("reads nothing that is not an object", () => {
    expect(isStoredPreference("preference")).toBe(false);
    expect(isStoredPreference(null)).toBe(false);
  });
});
