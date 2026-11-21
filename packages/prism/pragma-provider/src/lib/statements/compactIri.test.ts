import { describe, expect, it } from "vitest";
import { compactIri } from "./compactIri.js";

describe("compactIri", () => {
  const prefixes = new Map([
    ["ex", "https://example.org/"],
    ["exo", "https://example.org/ontology#"],
  ]);

  it("compacts by the longest namespace the IRI starts with", () => {
    expect(compactIri("https://example.org/ontology#tier", prefixes)).toBe(
      "exo:tier",
    );
    expect(compactIri("https://example.org/thing", prefixes)).toBe("ex:thing");
  });

  it("leaves an IRI no namespace matches whole", () => {
    expect(compactIri("urn:x", prefixes)).toBe("urn:x");
  });
});
