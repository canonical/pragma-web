import { createTranslator } from "@canonical/i18n-core";
import { describe, expect, it } from "vitest";
import { MESSAGES } from "#i18n";
import describeFormations from "./describeFormations.js";

/** The app's translator, as the catalog hook gives it outside a provider. */
const t = createTranslator("en", MESSAGES);

describe("describeFormations", () => {
  it("reads the count, then the ranges of length and capacity", () => {
    expect(
      describeFormations(
        [
          { length: 120000, capacity: 980 },
          { length: 60000, capacity: 490 },
        ],
        t,
      ),
    ).toEqual([
      { term: "Formations", value: "2" },
      { term: "Length", value: "60–120 m" },
      { term: "Capacity", value: "490–980 passengers" },
    ]);
  });

  it("reads one formation's measures as single values", () => {
    expect(describeFormations([{ length: 107200, capacity: 880 }], t)).toEqual([
      { term: "Formations", value: "1" },
      { term: "Length", value: "107.2 m" },
      { term: "Capacity", value: "880 passengers" },
    ]);
  });

  it("reads a stock with no formation as its count alone", () => {
    expect(describeFormations([], t)).toEqual([
      { term: "Formations", value: "0" },
    ]);
  });
});
