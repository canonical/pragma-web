import { describe, expect, it } from "vitest";
import nameStubs from "./nameStubs.js";

/** The terms a set of stubs is named by, in IRI order. */
const termsOf = (iris: readonly string[], loaded: readonly string[] = []) =>
  [...nameStubs(iris, new Set(loaded)).values()].map(({ term }) => term);

describe("nameStubs", () => {
  it.each([
    ["http://www.w3.org/1999/02/22-rdf-syntax-ns#List", "rdf:List"],
    ["http://www.w3.org/2004/02/skos/core#Concept", "skos:Concept"],
    ["http://xmlns.com/foaf/0.1/Person", "foaf:Person"],
    ["http://purl.org/dc/terms/Agent", "dcterms:Agent"],
    ["http://purl.org/dc/elements/1.1/Thing", "dc:Thing"],
    ["https://dt.canonical.com/TokenSymbol", "dt:TokenSymbol"],
    ["https://example.org/vocab/Thing", "vocab:Thing"],
    ["https://example.org/terms#Thing", "terms:Thing"],
    ["urn:x:Thing", "urn:x:Thing"],
  ])("names %s as %s", (iri, term) => {
    expect(termsOf([iri])).toEqual([term]);
  });

  it("keeps the local name apart from the prefix", () => {
    expect(
      nameStubs(["https://dt.canonical.com/TokenSymbol"], new Set()).get(
        "https://dt.canonical.com/TokenSymbol",
      ),
    ).toEqual({ prefix: "dt", local: "TokenSymbol", term: "dt:TokenSymbol" });
  });

  it("tells two stubs of one name apart by their hosts", () => {
    expect(
      termsOf([
        "https://a.example/vocab/Thing",
        "https://b.example/vocab/Thing",
      ]),
    ).toEqual(["a.vocab:Thing", "b.vocab:Thing"]);
  });

  it("tells a hash namespace from a slash one by the whole IRI", () => {
    expect(termsOf(["http://x/ns#Thing", "http://x/ns/Thing"])).toEqual([
      "http://x/ns#Thing",
      "http://x/ns/Thing",
    ]);
  });

  it("names apart only the stubs that clash", () => {
    expect(
      termsOf([
        "https://a.example/vocab/Thing",
        "https://b.example/vocab/Thing",
        "https://b.example/vocab/Other",
      ]),
    ).toEqual(["a.vocab:Thing", "vocab:Other", "b.vocab:Thing"]);
  });

  it("never takes a loaded namespace's prefix: the stub keeps its box under a fuller name", () => {
    expect(termsOf(["https://ds.example.org/X"], ["ds"])).toEqual([
      "https://ds.example.org/X",
    ]);
    expect(termsOf(["https://example.org/ds/X"], ["ds"])).toEqual([
      "example.ds:X",
    ]);
  });
});
