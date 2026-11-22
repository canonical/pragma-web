import { describe, expect, it } from "vitest";
import { readSearchState, searchValues } from "./searchValues.js";

describe("searchValues", () => {
  it("keeps the text, type, cursor, page and sheet and drops any other key", async () => {
    const result = await searchValues["~standard"].validate({
      q: "but",
      type: "ex:A",
      after: "c",
      page: "2",
      as: "table",
      sheet: "filter",
    });
    expect(result).toEqual({
      value: { q: "but", type: "ex:A", after: "c", page: "2", sheet: "filter" },
    });
  });

  it("drops a key whose value has no text", async () => {
    const result = await searchValues["~standard"].validate({
      q: "but",
      sheet: "",
    });
    expect(result).toEqual({ value: { q: "but" } });
  });
});

describe("readSearchState", () => {
  it("reads a later page with its cursor", () => {
    expect(
      readSearchState({ q: "but", type: "ex:A", after: "c", page: "3" }),
    ).toEqual({ text: "but", type: "ex:A", after: "c", page: 3 });
  });

  it("reads the first page when the page or its cursor is missing", () => {
    expect(readSearchState({ q: "but", page: "2" })).toEqual({
      text: "but",
      type: undefined,
      after: undefined,
      page: 1,
    });
    expect(readSearchState({ after: "c", page: "x" })).toEqual({
      text: "",
      type: undefined,
      after: undefined,
      page: 1,
    });
    expect(readSearchState({ q: "but", after: "c" })).toEqual({
      text: "but",
      type: undefined,
      after: undefined,
      page: 1,
    });
  });
});
