import { describe, expect, it } from "vitest";
import compactUri from "./compactUri.js";
import expandUri from "./expandUri.js";
import type { OntologyNamespace } from "./types.js";

/** A #-namespace and a /-namespace, as the graph states them. */
const NAMESPACES: readonly OntologyNamespace[] = [
  { prefix: "metro", namespace: "https://metro.example/onto#" },
  { prefix: "ds", namespace: "https://ds.canonical.com/" },
];

describe("expandUri", () => {
  it("expands a compact term under its ontology's namespace", () => {
    expect(expandUri("metro:Line", NAMESPACES)).toBe(
      "https://metro.example/onto#Line",
    );
    expect(expandUri("ds:UIBlock", NAMESPACES)).toBe(
      "https://ds.canonical.com/UIBlock",
    );
  });

  it("keeps a full IRI under a known namespace as it is", () => {
    expect(expandUri("https://metro.example/onto#Line", NAMESPACES)).toBe(
      "https://metro.example/onto#Line",
    );
  });

  it("passes a prefix no ontology declares, or no prefix, through", () => {
    expect(expandUri("xsd:string", NAMESPACES)).toBe("xsd:string");
    expect(expandUri("geo:GeoPoint", NAMESPACES)).toBe("geo:GeoPoint");
    expect(expandUri("Line", NAMESPACES)).toBe("Line");
    expect(expandUri(":Line", NAMESPACES)).toBe(":Line");
  });

  it("undoes compactUri", () => {
    const iri = "https://metro.example/onto#Station";
    expect(expandUri(compactUri(iri, NAMESPACES), NAMESPACES)).toBe(iri);
  });
});
