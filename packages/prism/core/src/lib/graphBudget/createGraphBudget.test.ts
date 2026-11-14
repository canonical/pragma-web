import { describe, expect, it } from "vitest";
import {
  GRAPH_BAND_MEMBERS_MAX,
  GRAPH_BUDGET,
  GRAPH_DRAWN_NODES_MAX,
  GRAPH_FETCHED_NODES_MAX,
  GRAPH_LABEL_PX_MIN,
  GRAPH_SVG_BYTES_MAX,
  GRAPH_SVG_ELEMENTS_MAX,
} from "./constants.js";
import createGraphBudget from "./createGraphBudget.js";

describe("GRAPH_BUDGET", () => {
  it("holds every named budget at its default", () => {
    expect(GRAPH_BUDGET).toEqual({
      drawnNodesMax: GRAPH_DRAWN_NODES_MAX,
      bandMembersMax: GRAPH_BAND_MEMBERS_MAX,
      fetchedNodesMax: GRAPH_FETCHED_NODES_MAX,
      svgBytesMax: GRAPH_SVG_BYTES_MAX,
      svgElementsMax: GRAPH_SVG_ELEMENTS_MAX,
      labelPxMin: GRAPH_LABEL_PX_MIN,
    });
  });
});

describe("createGraphBudget", () => {
  it("returns the defaults without overrides", () => {
    expect(createGraphBudget()).toEqual(GRAPH_BUDGET);
  });

  it("takes a stricter value bare", () => {
    expect(
      createGraphBudget({ drawnNodesMax: 24, labelPxMin: 14 }),
    ).toMatchObject({ drawnNodesMax: 24, labelPxMin: 14 });
  });

  it("takes a value above a default only with a reason", () => {
    expect(() =>
      createGraphBudget({ fetchedNodesMax: GRAPH_FETCHED_NODES_MAX + 1 }),
    ).toThrow("fetchedNodesMax past its default of 200 needs a reason");
    expect(() =>
      createGraphBudget({ svgBytesMax: { value: 131_072, reason: "  " } }),
    ).toThrow("svgBytesMax past its default of 65536 needs a reason");
    expect(
      createGraphBudget({
        svgBytesMax: { value: 131_072, reason: "the catalog's one wide map" },
      }).svgBytesMax,
    ).toBe(131_072);
  });

  it("takes a label floor below 12px only with a reason", () => {
    expect(() => createGraphBudget({ labelPxMin: 10 })).toThrow(
      "labelPxMin past its default of 12 needs a reason",
    );
    expect(
      createGraphBudget({ labelPxMin: { value: 10, reason: "a print view" } })
        .labelPxMin,
    ).toBe(10);
  });

  it("refuses a value that is not a positive number", () => {
    expect(() => createGraphBudget({ bandMembersMax: 0 })).toThrow(
      "bandMembersMax must be a positive number",
    );
    expect(() =>
      createGraphBudget({ svgElementsMax: Number.POSITIVE_INFINITY }),
    ).toThrow("svgElementsMax must be a positive number");
  });

  it("skips an override left undefined", () => {
    expect(createGraphBudget({ drawnNodesMax: undefined })).toEqual(
      GRAPH_BUDGET,
    );
  });

  it("is pure: the same overrides give the same budget, defaults untouched", () => {
    const overrides = { bandMembersMax: 8 } as const;
    expect(createGraphBudget(overrides)).toEqual(createGraphBudget(overrides));
    expect(GRAPH_BUDGET.bandMembersMax).toBe(GRAPH_BAND_MEMBERS_MAX);
  });
});
