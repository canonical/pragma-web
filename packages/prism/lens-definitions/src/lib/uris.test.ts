/**
 * The prefixed↔full URI codec, pinned against the live graph's real
 * namespaces (the graph returns full IRIs; term addresses are prefixed):
 * ds is /-terminated, cs and anatomy are #-terminated — both shapes must
 * round-trip, and unknown URIs must pass through rather than throw.
 */

import { describe, expect, it } from "vitest";
import { compactUri, expandUri, type OntologyNamespace } from "./uris.js";

/** The three live ontologies' addressing identities, as the graph states
 * them (`{ ontologies { prefix namespace } }`). */
const NAMESPACES: readonly OntologyNamespace[] = [
  { prefix: "ds", namespace: "https://ds.canonical.com/" },
  { prefix: "cs", namespace: "http://pragma.canonical.com/codestandards#" },
  { prefix: "anatomy", namespace: "http://anatomy-dsl.example.org/ontology#" },
];

describe("compactUri", () => {
  it("prefixes a /-namespace IRI", () => {
    expect(compactUri("https://ds.canonical.com/UIBlock", NAMESPACES)).toBe(
      "ds:UIBlock",
    );
  });

  it("prefixes a #-namespace IRI", () => {
    expect(
      compactUri(
        "http://pragma.canonical.com/codestandards#CodeStandard",
        NAMESPACES,
      ),
    ).toBe("cs:CodeStandard");
    expect(
      compactUri(
        "http://anatomy-dsl.example.org/ontology#NamedNode",
        NAMESPACES,
      ),
    ).toBe("anatomy:NamedNode");
  });

  it("passes an unknown IRI through unchanged", () => {
    expect(
      compactUri("http://www.w3.org/2001/XMLSchema#string", NAMESPACES),
    ).toBe("http://www.w3.org/2001/XMLSchema#string");
  });

  it("never emits an empty local name (a bare namespace passes through)", () => {
    expect(compactUri("https://ds.canonical.com/", NAMESPACES)).toBe(
      "https://ds.canonical.com/",
    );
  });

  it("prefers the longest matching namespace", () => {
    const nested: readonly OntologyNamespace[] = [
      { prefix: "outer", namespace: "https://example.org/" },
      { prefix: "inner", namespace: "https://example.org/inner/" },
    ];
    expect(compactUri("https://example.org/inner/Thing", nested)).toBe(
      "inner:Thing",
    );
  });
});

describe("expandUri", () => {
  it("expands a known prefix", () => {
    expect(expandUri("ds:UIBlock", NAMESPACES)).toBe(
      "https://ds.canonical.com/UIBlock",
    );
    expect(expandUri("anatomy:Node", NAMESPACES)).toBe(
      "http://anatomy-dsl.example.org/ontology#Node",
    );
  });

  it("passes unknown prefixes and colon-less strings through", () => {
    expect(expandUri("xsd:string", NAMESPACES)).toBe("xsd:string");
    expect(expandUri("no-colon-here", NAMESPACES)).toBe("no-colon-here");
  });
});

describe("round trip", () => {
  it("full → prefixed → full is identity for every live namespace", () => {
    for (const { namespace } of NAMESPACES) {
      const full = `${namespace}SomeTerm`;
      expect(expandUri(compactUri(full, NAMESPACES), NAMESPACES)).toBe(full);
    }
  });
});
