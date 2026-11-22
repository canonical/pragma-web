import { createTranslator } from "@canonical/i18n-core";
import { describe, expect, it } from "vitest";
import { MESSAGES } from "#i18n";
import { MOCK_INTERCHANGE, MOCK_STATION } from "../../../testing/fixtures.js";
import buildStopFacts from "./buildStopFacts.js";

const t = createTranslator("en", MESSAGES);

describe("buildStopFacts", () => {
  it("lists a stop's platforms, zone, lines and place, each by its property", () => {
    expect(buildStopFacts(MOCK_STATION, t)).toEqual([
      { property: "platformCount", label: "Platforms", value: 4 },
      { property: "inZone", label: "Zone", value: "Central Zone" },
      { property: "servesLine", label: "Lines", value: "North Line" },
      { property: "location", label: "Location", value: "51.53, -0.12" },
    ]);
  });

  it("joins the lines of an interchange into one value", () => {
    expect(
      buildStopFacts(MOCK_INTERCHANGE, t).find(
        (fact) => fact.property === "servesLine",
      ),
    ).toEqual({
      property: "servesLine",
      label: "Lines",
      value: "North Line, Circle Line, Coastal Line",
    });
  });

  it("leaves out each fact the graph does not assert", () => {
    expect(
      buildStopFacts({ platformCount: null, inZone: null, servesLine: [] }, t),
    ).toEqual([]);
  });
});
