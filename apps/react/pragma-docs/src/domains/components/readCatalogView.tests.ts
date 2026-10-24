import { describe, expect, it } from "vitest";
import { DEFAULT_CATALOG_VIEW } from "./constants.js";
import readCatalogView from "./readCatalogView.js";

describe("readCatalogView", () => {
  it("reads each view by its name", () => {
    expect(readCatalogView("cards")).toBe("cards");
    expect(readCatalogView("rows")).toBe("rows");
  });

  it("falls back to the default view for an absent or unknown value", () => {
    expect(readCatalogView(null)).toBe(DEFAULT_CATALOG_VIEW);
    expect(readCatalogView(undefined)).toBe(DEFAULT_CATALOG_VIEW);
    expect(readCatalogView("tiles")).toBe(DEFAULT_CATALOG_VIEW);
    expect(readCatalogView(["rows"])).toBe(DEFAULT_CATALOG_VIEW);
  });
});
