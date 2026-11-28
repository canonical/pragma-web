import { describe, expect, it } from "vitest";
import { NARROW_WIDTH_REM } from "../../src/lib/pattern/DataViews/common/controls/QueryBar/constants.js";
import {
  BAR_NARROW_REM,
  QUERY_BAR,
  QUERY_BAR_NARROW,
  QUERY_BAR_QUICK,
} from "./constants.js";

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

describe("the narrow journeys' threshold", () => {
  it("is the bar's own", () => {
    expect(BAR_NARROW_REM).toBe(NARROW_WIDTH_REM);
  });
});
