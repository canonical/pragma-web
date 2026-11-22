import { describe, expect, it } from "vitest";
import { METRO_NAMESPACES } from "../../testing/fixtures.js";
import compactIri from "./compactIri.js";

describe("compactIri", () => {
  it("compacts an IRI of a declared namespace", () => {
    expect(
      compactIri("https://metro.example/onto#servesLine", METRO_NAMESPACES),
    ).toBe("metro:servesLine");
  });

  it("lets the longest matching namespace win", () => {
    const nested = [
      { prefix: "ex", namespace: "https://example.org/" },
      { prefix: "exv", namespace: "https://example.org/vocab#" },
    ];
    expect(compactIri("https://example.org/vocab#term", nested)).toBe(
      "exv:term",
    );
    expect(compactIri("https://example.org/thing", nested)).toBe("ex:thing");
  });

  it("compacts the bare namespace to its prefix", () => {
    expect(compactIri("https://metro.example/onto#", METRO_NAMESPACES)).toBe(
      "metro:",
    );
  });

  it("passes a value no namespace matches through unchanged", () => {
    expect(compactIri("https://elsewhere.example/x", METRO_NAMESPACES)).toBe(
      "https://elsewhere.example/x",
    );
    expect(compactIri("metro:Line", METRO_NAMESPACES)).toBe("metro:Line");
  });
});
