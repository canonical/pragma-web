import { describe, expect, it } from "vitest";
import nameStub from "./nameStub.js";

describe("nameStub", () => {
  it.each([
    ["http://www.w3.org/1999/02/22-rdf-syntax-ns#List", "rdf:List"],
    ["https://dt.canonical.com/TokenSymbol", "dt:TokenSymbol"],
    ["https://example.org/vocab/Thing", "vocab:Thing"],
    ["https://example.org/terms#Thing", "terms:Thing"],
    ["urn:x:Thing", "urn:x:Thing"],
  ])("names %s as %s", (iri, term) => {
    expect(nameStub(iri).term).toBe(term);
  });

  it("keeps the local name apart from the prefix", () => {
    expect(nameStub("https://dt.canonical.com/TokenSymbol")).toEqual({
      prefix: "dt",
      local: "TokenSymbol",
      term: "dt:TokenSymbol",
    });
  });
});
