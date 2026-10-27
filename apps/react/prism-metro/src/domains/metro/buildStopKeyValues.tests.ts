import { createTranslator } from "@canonical/i18n-core";
import { describe, expect, it } from "vitest";
import { MESSAGES } from "#i18n";
import { MOCK_STATION } from "../../../testing/fixtures.js";
import buildStopKeyValues from "./buildStopKeyValues.js";

const t = createTranslator("en", MESSAGES);

describe("buildStopKeyValues", () => {
  it("lists the platforms, the zone and the lines, in that order", () => {
    expect(buildStopKeyValues(MOCK_STATION, t)).toEqual([
      { key: "Platforms", value: 4 },
      { key: "Zone", value: "Central Zone" },
      { key: "Lines", value: "North Line" },
    ]);
  });

  it("joins the lines a station serves into one value", () => {
    expect(
      buildStopKeyValues(
        {
          servesLine: [
            { _meta: { title: "North Line" } },
            { _meta: { title: "Circle Line" } },
          ],
        },
        t,
      ),
    ).toEqual([{ key: "Lines", value: "North Line, Circle Line" }]);
  });

  it("leaves out every value the graph does not assert", () => {
    expect(
      buildStopKeyValues(
        { platformCount: null, inZone: null, servesLine: [] },
        t,
      ),
    ).toEqual([]);
  });
});
