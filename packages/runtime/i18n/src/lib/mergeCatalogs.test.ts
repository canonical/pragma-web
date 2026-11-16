import { describe, expect, it } from "vitest";
import { baseCatalog as base } from "../../testing/fixtures.js";
import mergeCatalogs from "./mergeCatalogs.js";
import type { Messages } from "./types.js";

describe("mergeCatalogs", () => {
  it("lets overrides win and keeps untouched base keys", () => {
    const result = mergeCatalogs(base, { b: "over-b", c: "over-c" });
    expect(result).toEqual({ a: "base-a", b: "over-b", c: "over-c" });
  });

  it("returns a new object without mutating its inputs", () => {
    const overrides: Messages = { a: "over-a" };
    const result = mergeCatalogs(base, overrides);
    expect(result).not.toBe(base);
    expect(base).toEqual({ a: "base-a", b: "base-b" });
    expect(overrides).toEqual({ a: "over-a" });
  });
});
