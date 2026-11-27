import { describe, expect, it } from "vitest";
import { QUERY_BAR, QUERY_BAR_NARROW, QUERY_BAR_QUICK } from "./constants.js";

describe("the QueryBar journeys' story ids", () => {
  it("prefixes each page's stories by its title", () => {
    expect(QUERY_BAR).toBe("patterns-dataviews-controls-querybar");
    expect(QUERY_BAR_NARROW).toBe(
      "patterns-dataviews-controls-querybar-narrow",
    );
    expect(QUERY_BAR_QUICK).toBe(
      "patterns-dataviews-controls-querybar-quick-filters",
    );
  });
});
