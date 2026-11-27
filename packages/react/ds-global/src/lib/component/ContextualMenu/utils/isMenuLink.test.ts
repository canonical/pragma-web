import { describe, expect, it } from "vitest";
import isMenuLink from "./isMenuLink.js";

describe("isMenuLink", () => {
  it("holds for an enabled item with a url only", () => {
    expect(isMenuLink({ url: "#a", label: "A" })).toBe(true);
    expect(isMenuLink({ url: "#a", label: "A", disabled: true })).toBe(false);
    expect(isMenuLink({ key: "a", label: "A" })).toBe(false);
    expect(isMenuLink({ type: "separator", key: "s" })).toBe(false);
  });
});
