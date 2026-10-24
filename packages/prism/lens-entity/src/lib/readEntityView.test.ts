import { describe, expect, it } from "vitest";
import { DEFAULT_ENTITY_VIEW } from "./constants.js";
import readEntityView from "./readEntityView.js";

describe("readEntityView", () => {
  it("reads each view by its name", () => {
    expect(readEntityView("rows")).toBe("rows");
    expect(readEntityView("cards")).toBe("cards");
  });

  it("falls back to the default view for an absent or unknown value", () => {
    expect(readEntityView(null)).toBe(DEFAULT_ENTITY_VIEW);
    expect(readEntityView("tiles")).toBe(DEFAULT_ENTITY_VIEW);
    expect(readEntityView(["cards"])).toBe(DEFAULT_ENTITY_VIEW);
  });
});
