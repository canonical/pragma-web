import { describe, expect, it } from "vitest";
import { countTypeFacets } from "./countTypeFacets.js";

describe("countTypeFacets", () => {
  it("counts each type once, most first, then by IRI", () => {
    expect(countTypeFacets(["b", "a", "c", "c", "b", "c"])).toEqual([
      { type: "c", count: 3 },
      { type: "b", count: 2 },
      { type: "a", count: 1 },
    ]);
    expect(countTypeFacets(["b", "a"])).toEqual([
      { type: "a", count: 1 },
      { type: "b", count: 1 },
    ]);
  });

  it("counts nothing for no matches", () => {
    expect(countTypeFacets([])).toEqual([]);
  });
});
