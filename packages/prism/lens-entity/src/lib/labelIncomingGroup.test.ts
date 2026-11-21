import { describe, expect, it } from "vitest";
import { METRO_NAMESPACES } from "../../testing/fixtures.js";
import labelIncomingGroup from "./labelIncomingGroup.js";

const SERVES_LINE = "https://metro.example/onto#servesLine";

/** Words the entity's side as the catalog does. */
const nameInverse = (label: string): string => `Has this as ${label}`;

describe("labelIncomingGroup", () => {
  it("names many holders by the property's inverse plural label", () => {
    expect(
      labelIncomingGroup(
        {
          predicateUri: SERVES_LINE,
          total: 6,
          predicate: {
            label: "serves line",
            inverseLabel: "served by",
            inversePluralLabel: "served by stations",
          },
        },
        METRO_NAMESPACES,
        nameInverse,
      ),
    ).toBe("served by stations");
  });

  it("names one holder, or many with no inverse plural, by the inverse label", () => {
    const predicate = { label: "serves line", inverseLabel: "served by" };
    expect(
      labelIncomingGroup(
        { predicateUri: SERVES_LINE, total: 1, predicate },
        METRO_NAMESPACES,
        nameInverse,
      ),
    ).toBe("served by");
    expect(
      labelIncomingGroup(
        { predicateUri: SERVES_LINE, total: 4, predicate },
        METRO_NAMESPACES,
        nameInverse,
      ),
    ).toBe("served by");
  });

  it("words the entity's side around the label of a property with no inverse", () => {
    expect(
      labelIncomingGroup(
        {
          predicateUri: SERVES_LINE,
          total: 2,
          predicate: { label: "serves line", inverseLabel: null },
        },
        METRO_NAMESPACES,
        nameInverse,
      ),
    ).toBe("Has this as serves line");
    expect(
      labelIncomingGroup(
        { predicateUri: SERVES_LINE, total: 2, predicate: undefined },
        METRO_NAMESPACES,
        nameInverse,
      ),
    ).toBe("Has this as metro:servesLine");
  });
});
