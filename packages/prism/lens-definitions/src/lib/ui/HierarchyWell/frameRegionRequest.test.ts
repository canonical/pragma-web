import { GRAPH_BUDGET } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import { FOUR_NAMESPACE_GRAPH } from "../../../../testing/fixtures.js";
import layOutClassGraph from "../../classGraph/layOutClassGraph.js";
import frameRegionRequest from "./frameRegionRequest.js";
import measureVisibleBox from "./measureVisibleBox.js";

const layout = layOutClassGraph(FOUR_NAMESPACE_GRAPH, { budget: GRAPH_BUDGET });
const none = new Set<string>();

/** A well's element whose desktop canvas measures `width` by `height`. */
function createWell(width: number, height: number): Element {
  const root = document.createElement("div");
  root.innerHTML =
    '<div class="desktop"><svg class="viewport" xmlns="http://www.w3.org/2000/svg"></svg></div>';
  const svg = root.querySelector("svg");
  if (svg === null) throw new Error("no canvas");
  svg.getBoundingClientRect = () => new DOMRect(0, 0, width, height);
  return root;
}

describe("frameRegionRequest", () => {
  it("fits the region's own frame until the canvas is measured", () => {
    const frame = measureVisibleBox(layout, none, "anatomy");
    expect(frameRegionRequest(layout, none, "anatomy", null)).toEqual(frame);
    expect(
      frameRegionRequest(
        layout,
        none,
        "anatomy",
        document.createElement("div"),
      ),
    ).toEqual(frame);
    expect(
      frameRegionRequest(layout, none, "anatomy", createWell(0, 0)),
    ).toEqual(frame);
  });

  it("frames a picked region in the canvas's aspect, a box among its neighbours", () => {
    const box = frameRegionRequest(layout, none, "ds", createWell(880, 700));
    expect(box?.height).toBeCloseTo(((box?.width ?? 0) * 700) / 880, 9);
    const frame = measureVisibleBox(layout, none, "ds");
    expect(box?.width).toBeGreaterThan((frame?.width ?? 0) * 2);
  });

  it("fits a frame too large for the legible zoom as it is", () => {
    expect(
      frameRegionRequest(layout, none, "anatomy", createWell(120, 120)),
    ).toEqual(measureVisibleBox(layout, none, "anatomy"));
  });

  it("frames nothing for a region the layout does not draw", () => {
    expect(
      frameRegionRequest(layout, none, "absent", createWell(880, 700)),
    ).toBeUndefined();
  });
});
