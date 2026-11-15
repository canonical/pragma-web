import { createTranslator } from "@canonical/i18n-core";
import { describe, expect, it } from "vitest";
import { MESSAGES } from "#i18n";
import buildStockFacts from "./buildStockFacts.js";

/** The app's translator, as the catalog hook gives it outside a provider. */
const t = createTranslator("en", MESSAGES);

describe("buildStockFacts", () => {
  it("names the count, then the ranges of length and capacity", () => {
    expect(
      buildStockFacts(
        [
          { length: 120000, capacity: 980 },
          { length: 60000, capacity: 490 },
        ],
        t,
      ),
    ).toEqual([
      { property: "formations", label: "Formations", value: "2" },
      { property: "length", label: "Length", value: "60–120 m" },
      {
        property: "capacity",
        label: "Capacity",
        value: "490–980 passengers",
      },
    ]);
  });

  it("reads one formation's measures as single values", () => {
    expect(buildStockFacts([{ length: 107200, capacity: 880 }], t)).toEqual([
      { property: "formations", label: "Formations", value: "1" },
      { property: "length", label: "Length", value: "107.2 m" },
      { property: "capacity", label: "Capacity", value: "880 passengers" },
    ]);
  });

  it("names a stock with no formation by its count alone", () => {
    expect(buildStockFacts([], t)).toEqual([
      { property: "formations", label: "Formations", value: "0" },
    ]);
  });
});
