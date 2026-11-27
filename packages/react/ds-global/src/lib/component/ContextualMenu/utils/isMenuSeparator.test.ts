import { describe, expect, it } from "vitest";
import isMenuSeparator from "./isMenuSeparator.js";

describe("isMenuSeparator", () => {
  it("tells a separator from an item", () => {
    expect(isMenuSeparator({ type: "separator", key: "s" })).toBe(true);
    expect(isMenuSeparator({ key: "copy", label: "Copy" })).toBe(false);
  });
});
