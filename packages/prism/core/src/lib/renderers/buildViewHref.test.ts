import { describe, expect, it } from "vitest";
import buildViewHref from "./buildViewHref.js";

describe("buildViewHref", () => {
  it("writes the path and the parameters with values, in order", () => {
    expect(
      buildViewHref("/stations", { q: "cen", as: "cards", expand: undefined }),
    ).toBe("/stations?q=cen&as=cards");
  });

  it("writes the bare path when no parameter has a value", () => {
    expect(buildViewHref("/stations", { as: undefined })).toBe("/stations");
  });

  it("encodes the parameters' values", () => {
    expect(buildViewHref("/a", { q: "a b&c" })).toBe("/a?q=a+b%26c");
  });
});
