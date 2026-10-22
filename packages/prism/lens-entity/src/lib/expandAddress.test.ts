import { describe, expect, it } from "vitest";
import { METRO_NAMESPACES } from "../../testing/fixtures.js";
import expandAddress from "./expandAddress.js";

describe("expandAddress", () => {
  it("expands a compact address whose prefix the graph declares", () => {
    expect(expandAddress("metro:northgate", METRO_NAMESPACES)).toBe(
      "https://metro.example/onto#northgate",
    );
    expect(expandAddress("geo:zone-1", METRO_NAMESPACES)).toBe(
      "https://geo.example/onto#zone-1",
    );
  });

  it("expands a prefix with an empty local part to the namespace itself", () => {
    expect(expandAddress("metro:", METRO_NAMESPACES)).toBe(
      "https://metro.example/onto#",
    );
  });

  it("passes an absolute IRI through unchanged", () => {
    expect(
      expandAddress("https://metro.example/onto#northgate", METRO_NAMESPACES),
    ).toBe("https://metro.example/onto#northgate");
  });

  it("passes an unknown prefix and a colon-free address through unchanged", () => {
    expect(expandAddress("nowhere:northgate", METRO_NAMESPACES)).toBe(
      "nowhere:northgate",
    );
    expect(expandAddress("northgate", METRO_NAMESPACES)).toBe("northgate");
  });
});
