import { describe, expect, it } from "vitest";
import hasVisibleChildren from "./hasVisibleChildren.js";

describe("hasVisibleChildren", () => {
  it.each([undefined, null, true, false, ""])(
    "finds nothing visible in %j",
    (children) => {
      expect(hasVisibleChildren(children)).toBe(false);
    },
  );

  it.each(["Label", 0, ["a"]])("finds %j visible", (children) => {
    expect(hasVisibleChildren(children)).toBe(true);
  });
});
