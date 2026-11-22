import { describe, expect, it } from "vitest";
import { STATIONS_BINDING } from "../../testing/fixtures.js";
import buildEntityIndexVariables from "./buildEntityIndexVariables.js";
import { ENTITY_PAGE_SIZE } from "./constants.js";

describe("buildEntityIndexVariables", () => {
  it("asks for the binding's class, from its first page", () => {
    expect(buildEntityIndexVariables(STATIONS_BINDING)).toEqual({
      classUri: "metro:Station",
      classId: "metro:Station",
      filters: null,
      count: ENTITY_PAGE_SIZE,
      cursor: null,
    });
  });

  it("carries the facet filters the address applies", () => {
    const filters = [{ field: "servesLine", values: [null] }];
    expect(
      buildEntityIndexVariables(STATIONS_BINDING, filters).filters,
    ).toEqual(filters);
  });
});
