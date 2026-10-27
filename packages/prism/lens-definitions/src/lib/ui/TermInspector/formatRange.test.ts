import { describe, expect, it } from "vitest";
import formatRange from "./formatRange.js";

const NAMESPACES = [{ prefix: "ds", namespace: "https://ds.canonical.com/" }];

describe("formatRange", () => {
  it("compacts a class of the graph under its ontology's prefix", () => {
    expect(formatRange("https://ds.canonical.com/Tier", NAMESPACES)).toBe(
      "ds:Tier",
    );
  });

  it("compacts an XML Schema datatype under xsd", () => {
    expect(
      formatRange("http://www.w3.org/2001/XMLSchema#anyURI", NAMESPACES),
    ).toBe("xsd:anyURI");
  });

  it("leaves any other range as given", () => {
    expect(formatRange("https://example.com/Other", NAMESPACES)).toBe(
      "https://example.com/Other",
    );
  });
});
