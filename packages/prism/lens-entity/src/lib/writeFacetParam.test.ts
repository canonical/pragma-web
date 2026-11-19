import { describe, expect, it } from "vitest";
import readFacetParams from "./readFacetParams.js";
import writeFacetParam from "./writeFacetParam.js";

const NAMESPACES = [{ prefix: "metro", namespace: "https://metro.example/" }];

describe("writeFacetParam", () => {
  it("writes curies where the prefixes give one, full IRIs otherwise", () => {
    expect(
      writeFacetParam(
        ["https://metro.example/circle-line", "https://other.example/x", null],
        NAMESPACES,
      ),
    ).toBe("metro:circle-line,https://other.example/x,none");
  });

  it("writes nothing when no value is applied", () => {
    expect(writeFacetParam([], NAMESPACES)).toBeUndefined();
  });

  it("is read back by readFacetParams", () => {
    const values = ["https://metro.example/circle-line", null];
    const text = writeFacetParam(values, NAMESPACES);
    expect(
      readFacetParams({ servesLine: text }, ["servesLine"], NAMESPACES),
    ).toEqual([{ field: "servesLine", values }]);
  });
});
