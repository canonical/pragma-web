import { describe, expect, it } from "vitest";
import isMenuSeparator from "./isMenuSeparator.js";

describe("isMenuSeparator", () => {
  it("is true for a separator", () => {
    expect(isMenuSeparator({ type: "separator", key: "s" })).toBe(true);
  });

  it("is false for an item", () => {
    expect(isMenuSeparator({ key: "copy", label: "Copy" })).toBe(false);
  });
});
