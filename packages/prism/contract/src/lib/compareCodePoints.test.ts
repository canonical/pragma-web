import { describe, expect, it } from "vitest";
import compareCodePoints from "./compareCodePoints.js";

describe("compareCodePoints", () => {
  it("orders by code point, not by locale", () => {
    expect(["b", "a", "B", "é"].toSorted(compareCodePoints)).toEqual([
      "B",
      "a",
      "b",
      "é",
    ]);
  });

  it("puts an astral character after every character of the BMP", () => {
    expect(["\u{1F600}", "\uFF46", "a"].toSorted(compareCodePoints)).toEqual([
      "a",
      "\uFF46",
      "\u{1F600}",
    ]);
  });

  it("puts a string before every longer string it begins", () => {
    expect(compareCodePoints("ab", "abc")).toBeLessThan(0);
  });

  it("finds two equal strings equal", () => {
    expect(compareCodePoints("a", "a")).toBe(0);
  });
});
