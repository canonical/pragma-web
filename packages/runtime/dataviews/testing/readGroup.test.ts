import { describe, expect, it } from "vitest";
import readGroup from "./readGroup.js";

describe("readGroup", () => {
  it("returns the text of a group that read", () => {
    const match = /(a)(b)?/.exec("ab");
    if (match === null) {
      throw new Error("expected a match");
    }
    expect(readGroup(match, 2)).toBe("b");
  });

  it("throws for a group that read nothing", () => {
    const match = /(a)(b)?/.exec("a");
    if (match === null) {
      throw new Error("expected a match");
    }
    expect(() => readGroup(match, 2)).toThrow("expected capture group 2");
  });
});
