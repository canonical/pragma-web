import { describe, expect, it } from "vitest";
import { DEFAULT_HISTORY, FIXED_HISTORY, PROVIDER_HOSTS } from "./constants.js";

describe("the provider's constants", () => {
  it("pushes every transition by default, but the search, which replaces", () => {
    expect(DEFAULT_HISTORY).toEqual({
      filter: "push",
      search: "replace",
      sort: "push",
      group: "push",
      window: "push",
      view: "push",
    });
    expect(Object.isFrozen(DEFAULT_HISTORY)).toBe(true);
  });

  it("writes no collapse or adoption, and replaces for a reset or a revert", () => {
    expect(FIXED_HISTORY).toEqual({
      collapse: null,
      adopt: null,
      reset: "replace",
      revert: "replace",
    });
    expect(Object.isFrozen(FIXED_HISTORY)).toBe(true);
  });

  it("holds each provider's host weakly", () => {
    expect(PROVIDER_HOSTS).toBeInstanceOf(WeakMap);
  });
});
