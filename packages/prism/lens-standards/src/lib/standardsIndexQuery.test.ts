import { describe, expect, it } from "vitest";
import { STANDARDS_PAGE_SIZE } from "./constants.js";
import { buildStandardsIndexVariables } from "./standardsIndexQuery.js";

describe("buildStandardsIndexVariables", () => {
  it("asks for the first page of the bound class's instances", () => {
    expect(buildStandardsIndexVariables("cs:CodeStandard")).toEqual({
      classUri: "cs:CodeStandard",
      count: STANDARDS_PAGE_SIZE,
      cursor: null,
    });
  });
});
