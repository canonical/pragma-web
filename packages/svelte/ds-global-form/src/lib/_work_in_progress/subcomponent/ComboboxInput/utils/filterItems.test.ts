import { describe, expect, it } from "vitest";
import convertItemToString from "./convertItemToString.js";
import filterItems from "./filterItems.js";
import getHighlightedIndex from "./getHighlightedIndex.js";

const items = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
];

describe("filterItems", () => {
  it("keeps every item for empty text and filters case-insensitively", () => {
    expect(filterItems(items, "")).toEqual(items);
    expect(filterItems(items, "BAN")).toEqual([items[1]]);
  });
});

describe("convertItemToString", () => {
  it("returns the label, or an empty string without an item", () => {
    expect(convertItemToString(items[0])).toBe("Apple");
    expect(convertItemToString(null)).toBe("");
  });
});

describe("getHighlightedIndex", () => {
  it("moves and wraps at both ends", () => {
    expect(getHighlightedIndex(0, 1, 3, true)).toBe(1);
    expect(getHighlightedIndex(2, 1, 3, true)).toBe(0);
    expect(getHighlightedIndex(0, -1, 3, true)).toBe(2);
    expect(getHighlightedIndex(1, 10, 3, true)).toBe(0);
  });

  it("stops at either end when it does not wrap", () => {
    expect(getHighlightedIndex(1, 10, 3, false)).toBe(2);
    expect(getHighlightedIndex(1, -10, 3, false)).toBe(0);
    expect(getHighlightedIndex(-1, 10, 30, false)).toBe(9);
    expect(getHighlightedIndex(-1, -10, 30, false)).toBe(20);
  });

  it("starts from the matching end when nothing, or a gone item, is highlighted", () => {
    expect(getHighlightedIndex(-1, 1, 3, true)).toBe(0);
    expect(getHighlightedIndex(-1, -1, 3, true)).toBe(2);
    // A list that shrank under the highlight.
    expect(getHighlightedIndex(5, 1, 3, true)).toBe(0);
    expect(getHighlightedIndex(5, -1, 3, true)).toBe(2);
  });

  it("highlights nothing in an empty list", () => {
    expect(getHighlightedIndex(0, 1, 0, true)).toBe(-1);
  });
});
