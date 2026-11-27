import { describe, expect, it } from "vitest";
import isMenuItemDisabled from "./isMenuItemDisabled.js";

describe("isMenuItemDisabled", () => {
  it("reads the given flag and the tree's own", () => {
    expect(isMenuItemDisabled({ key: "a", label: "A" })).toBe(false);
    expect(isMenuItemDisabled({ key: "a", label: "A", disabled: true })).toBe(
      true,
    );
    expect(
      isMenuItemDisabled({ key: "a", label: "A", unavailable: true }),
    ).toBe(true);
  });
});
