import { describe, expect, it } from "vitest";
import { comparePredicates } from "./comparePredicates.js";

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

describe("comparePredicates", () => {
  const compare = comparePredicates((uri) => uri.replace("urn:x:", "x:"));

  it("puts rdf:type first, then orders by compact form", () => {
    expect(
      ["urn:x:b", RDF_TYPE, "urn:x:a"].toSorted(compare),
    ).toEqual([RDF_TYPE, "urn:x:a", "urn:x:b"]);
    expect(compare("urn:x:a", RDF_TYPE)).toBe(1);
  });

  it("calls a predicate equal to itself", () => {
    expect(compare(RDF_TYPE, RDF_TYPE)).toBe(0);
    expect(compare("urn:x:a", "urn:x:a")).toBe(0);
  });
});
