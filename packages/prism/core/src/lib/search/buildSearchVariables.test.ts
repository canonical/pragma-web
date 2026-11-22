import { describe, expect, it } from "vitest";
import buildSearchVariables from "./buildSearchVariables.js";
import { SEARCH_PAGE_SIZE } from "./constants.js";

describe("buildSearchVariables", () => {
  it("trims the text and asks for one page", () => {
    expect(buildSearchVariables("  depot ")).toEqual({
      text: "depot",
      first: SEARCH_PAGE_SIZE,
    });
  });
});

describe("buildSearchVariables with the page's state", () => {
  it("applies the type and the cursor on the second page", () => {
    expect(
      buildSearchVariables("but", { type: "ex:A", after: "c", page: 2 }),
    ).toEqual({
      text: "but",
      first: 20,
      types: ["ex:A"],
      after: "c",
      hasEarlier: true,
      earlierFirst: 20,
    });
  });

  it("asks from the third page for the window that ends before it", () => {
    expect(buildSearchVariables("but", { after: "c", page: 4 })).toEqual({
      text: "but",
      first: 20,
      after: "c",
      hasEarlier: true,
      earlierFirst: 60,
      hasPrevious: true,
      previousFirst: 40,
    });
  });
});
