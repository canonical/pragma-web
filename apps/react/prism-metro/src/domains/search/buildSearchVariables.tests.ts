import { describe, expect, it } from "vitest";
import buildSearchVariables from "./buildSearchVariables.js";
import { SEARCH_PAGE_SIZE } from "./constants.js";
import readSearchText from "./readSearchText.js";

describe("buildSearchVariables", () => {
  it("trims the text and asks for one page", () => {
    expect(buildSearchVariables("  depot ")).toEqual({
      text: "depot",
      first: SEARCH_PAGE_SIZE,
    });
  });
});

describe("readSearchText", () => {
  it("reads the q parameter", () => {
    expect(readSearchText({ q: "depot" })).toBe("depot");
  });

  it("reads no text from an address without one", () => {
    expect(readSearchText({})).toBe("");
  });
});
