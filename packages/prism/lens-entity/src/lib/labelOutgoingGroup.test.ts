import { describe, expect, it } from "vitest";
import { METRO_NAMESPACES } from "../../testing/fixtures.js";
import labelOutgoingGroup from "./labelOutgoingGroup.js";

const SERVES_LINE = "https://metro.example/onto#servesLine";

describe("labelOutgoingGroup", () => {
  it("names many values by the property's plural label", () => {
    const predicate = { label: "serves line", pluralLabel: "serves lines" };
    expect(
      labelOutgoingGroup(
        { predicateUri: SERVES_LINE, total: 3, predicate },
        METRO_NAMESPACES,
      ),
    ).toBe("serves lines");
  });

  it("names one value, or many with no plural, by the property's label", () => {
    expect(
      labelOutgoingGroup(
        {
          predicateUri: SERVES_LINE,
          total: 1,
          predicate: { label: "serves line", pluralLabel: "serves lines" },
        },
        METRO_NAMESPACES,
      ),
    ).toBe("serves line");
    expect(
      labelOutgoingGroup(
        {
          predicateUri: SERVES_LINE,
          total: 3,
          predicate: { label: "serves line", pluralLabel: null },
        },
        METRO_NAMESPACES,
      ),
    ).toBe("serves line");
  });

  it("names a predicate the graph does not describe by its compact IRI", () => {
    expect(
      labelOutgoingGroup(
        { predicateUri: SERVES_LINE, total: 2, predicate: null },
        METRO_NAMESPACES,
      ),
    ).toBe("metro:servesLine");
  });
});
