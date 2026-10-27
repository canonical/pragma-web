import { describe, expect, it } from "vitest";
import { DEFAULT_JOURNEY_VIEW } from "./constants.js";
import readJourneyView from "./readJourneyView.js";

describe("readJourneyView", () => {
  it("reads each view by its name", () => {
    expect(readJourneyView("table")).toBe("table");
    expect(readJourneyView("graph")).toBe("graph");
  });

  it("falls back to the table for an absent or unknown value", () => {
    expect(readJourneyView(null)).toBe(DEFAULT_JOURNEY_VIEW);
    expect(readJourneyView(undefined)).toBe(DEFAULT_JOURNEY_VIEW);
    expect(readJourneyView("map")).toBe(DEFAULT_JOURNEY_VIEW);
    expect(readJourneyView(["graph"])).toBe(DEFAULT_JOURNEY_VIEW);
  });
});
