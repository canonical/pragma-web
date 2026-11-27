import { describe, expect, it } from "vitest";
import convertItemToString from "./convertItemToString.js";
import filterItems from "./filterItems.js";

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
