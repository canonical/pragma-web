import { describe, expect, it } from "vitest";
import skipBalanced from "./skipBalanced.js";

describe("skipBalanced", () => {
  it("returns the offset past the closing bracket", () => {
    expect(skipBalanced("f(a(b))c", 1, "(", ")")).toBe(7);
  });

  it("returns the length when the bracket never closes", () => {
    expect(skipBalanced("f(a(b)", 1, "(", ")")).toBe(6);
  });
});
