import { describe, expect, it } from "vitest";
import readFacetParams from "./readFacetParams.js";

const NAMESPACES = [{ prefix: "metro", namespace: "https://metro.example/" }];

describe("readFacetParams", () => {
  it("expands a curie and keeps a full IRI", () => {
    expect(
      readFacetParams(
        { servesLine: "metro:circle-line,https://other.example/x" },
        ["servesLine"],
        NAMESPACES,
      ),
    ).toEqual([
      {
        field: "servesLine",
        values: [
          "https://metro.example/circle-line",
          "https://other.example/x",
        ],
      },
    ]);
  });

  it("reads none as the none bucket", () => {
    expect(readFacetParams({ inZone: "none" }, ["inZone"], NAMESPACES)).toEqual(
      [{ field: "inZone", values: [null] }],
    );
  });

  it("ignores parameters that name no facet, and empty ones", () => {
    expect(
      readFacetParams(
        { q: "cen", servesLine: "", inZone: "," },
        ["servesLine", "inZone"],
        NAMESPACES,
      ),
    ).toEqual([]);
  });
});
