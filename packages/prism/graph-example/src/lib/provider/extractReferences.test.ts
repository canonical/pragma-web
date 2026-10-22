import { describe, expect, it } from "vitest";
import {
  EXTRACTION_CASES,
  EXTRACTION_PREFIXES,
} from "../../testing/fixtures.js";
import { extractReferences } from "./extractReferences.js";

describe("extractReferences", () => {
  it.each(EXTRACTION_CASES)("$name", ({ markdown, expected }) => {
    expect(extractReferences(markdown, EXTRACTION_PREFIXES)).toEqual(expected);
  });

  it("yields nothing for an empty document", () => {
    expect(extractReferences("", EXTRACTION_PREFIXES)).toEqual([]);
  });
});
