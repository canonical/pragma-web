import { describe, expect, it } from "vitest";
import entityIndexSearch from "./entityIndexSearch.js";

describe("entityIndexSearch", () => {
  it("reads the view the search parameters name", () => {
    expect(entityIndexSearch["~standard"].validate({ view: "cards" })).toEqual({
      value: { view: "cards" },
    });
  });

  it("reads the default view when the parameters name none it knows", () => {
    expect(entityIndexSearch["~standard"].validate({})).toEqual({
      value: { view: "rows" },
    });
    expect(entityIndexSearch["~standard"].validate({ view: "tiles" })).toEqual({
      value: { view: "rows" },
    });
  });
});
