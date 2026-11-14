import { describe, expect, it } from "vitest";
import { listUndescribedTerms } from "./listUndescribedTerms.js";
import type { ServedOntology } from "./types.js";

const EX = "https://example.org/terms#";

/** Two ontologies covering every way a served term can lack a description. */
const ONTOLOGIES: readonly ServedOntology[] = [
  {
    classes: [
      { uri: `${EX}Station`, definition: "A place trains stop at." },
      { uri: `${EX}Line`, definition: null },
      { uri: `${EX}Depot`, definition: "" },
    ],
    properties: [
      {
        uri: `${EX}servedBy`,
        definition: "The lines that stop at a station.",
        inverse: { uri: `${EX}serves`, definition: null },
      },
      { uri: `${EX}name`, definition: "   ", inverse: null },
    ],
  },
  {
    classes: [{ uri: `${EX}Station`, definition: "A place trains stop at." }],
    properties: [
      {
        uri: `${EX}serves`,
        definition: null,
        inverse: {
          uri: `${EX}servedBy`,
          definition: "The lines that stop at a station.",
        },
      },
    ],
  },
];

describe("listUndescribedTerms", () => {
  it("lists every served term once, sorted, inverse sides included", () => {
    expect(listUndescribedTerms(ONTOLOGIES).terms).toEqual([
      `${EX}Depot`,
      `${EX}Line`,
      `${EX}Station`,
      `${EX}name`,
      `${EX}servedBy`,
      `${EX}serves`,
    ]);
  });

  it("lists null, empty and whitespace-only definitions as undescribed", () => {
    expect(listUndescribedTerms(ONTOLOGIES).undescribed).toEqual([
      `${EX}Depot`,
      `${EX}Line`,
      `${EX}name`,
      `${EX}serves`,
    ]);
  });

  it("lists nothing for no ontologies", () => {
    expect(listUndescribedTerms([])).toEqual({ terms: [], undescribed: [] });
  });
});
