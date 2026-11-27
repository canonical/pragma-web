import { describe, expect, it } from "vitest";
import isChoiceChecked from "./isChoiceChecked.js";
import toggleChoice from "./toggleChoice.js";

describe("toggleChoice", () => {
  it("selects the checked radio and ignores an unchecked one", () => {
    expect(toggleChoice("a", "b", true, false)).toBe("b");
    expect(toggleChoice("a", "b", false, false)).toBe("a");
  });

  it("adds and removes a checkbox value", () => {
    expect(toggleChoice(["a"], "b", true, true)).toEqual(["a", "b"]);
    expect(toggleChoice(["a", "b"], "a", false, true)).toEqual(["b"]);
    expect(toggleChoice(undefined, "a", true, true)).toEqual(["a"]);
  });
});

describe("isChoiceChecked", () => {
  it("compares a radio value and searches a checkbox selection", () => {
    expect(isChoiceChecked("a", "a", false)).toBe(true);
    expect(isChoiceChecked(["a"], "a", true)).toBe(true);
    expect(isChoiceChecked("a", "a", true)).toBe(false);
    expect(isChoiceChecked(undefined, "a", false)).toBe(false);
  });
});
