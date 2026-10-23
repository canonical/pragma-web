import { describe, expect, it } from "vitest";
import createClassGraphSetup from "../../../../testing/createClassGraphSetup.js";
import { VIEW_MARGIN } from "../../classGraph/constants.js";
import measureVisibleBox from "./measureVisibleBox.js";

const { layout } = createClassGraphSetup();
const nodes = [...layout.nodes.values()];

describe("measureVisibleBox", () => {
  it("fits the whole graph when nothing is hidden and no region is asked for", () => {
    expect(measureVisibleBox(layout, new Set(), undefined)).toBeUndefined();
  });

  it("fits a region a reader asks for, with the view margin", () => {
    const region = layout.regions.find(
      (candidate) => candidate.prefix === "cs",
    );
    if (region === undefined) throw new Error("no cs region");
    expect(measureVisibleBox(layout, new Set(), "cs")).toEqual({
      x: region.x - VIEW_MARGIN,
      y: region.y - VIEW_MARGIN,
      width: region.w + 2 * VIEW_MARGIN,
      height: region.h + 2 * VIEW_MARGIN,
    });
  });

  it("fits the classes the filter leaves", () => {
    const shown = nodes.filter((node) => node.region === "cs");
    const hidden = new Set(
      nodes.filter((node) => node.region !== "cs").map((node) => node.uri),
    );
    const box = measureVisibleBox(layout, hidden, undefined);
    const left = Math.min(...shown.map((node) => node.x));
    expect(box?.x).toBe(left - VIEW_MARGIN);
  });

  it("fits the whole graph when the filter hides every class", () => {
    const hidden = new Set(nodes.map((node) => node.uri));
    expect(measureVisibleBox(layout, hidden, undefined)).toBeUndefined();
  });
});
