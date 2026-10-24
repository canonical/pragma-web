import { describe, expect, it } from "vitest";
import catalogSearch from "./catalogSearch.js";

describe("catalogSearch", () => {
  it("reads the view the search parameters name", () => {
    expect(catalogSearch["~standard"].validate({ view: "rows" })).toEqual({
      value: { view: "rows" },
    });
  });

  it("reads the default view when the parameters name none it knows", () => {
    expect(catalogSearch["~standard"].validate({})).toEqual({
      value: { view: "cards" },
    });
    expect(catalogSearch["~standard"].validate({ view: "tiles" })).toEqual({
      value: { view: "cards" },
    });
    expect(catalogSearch["~standard"].validate(undefined)).toEqual({
      value: { view: "cards" },
    });
  });

  it("names the site as its vendor", () => {
    expect(catalogSearch["~standard"].vendor).toBe("pragma-docs");
  });
});
