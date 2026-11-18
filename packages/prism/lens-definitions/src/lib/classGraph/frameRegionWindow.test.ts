import {
  GRAPH_BUDGET,
  intersectsRect,
  measureRegionLabelWidth,
  REGION_LABEL_ROW,
  type Rect,
} from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import { FOUR_NAMESPACE_GRAPH } from "../../../testing/fixtures.js";
import metroGraph from "../../../testing/records/metroGraph.js";
import {
  FIT_TOLERANCE,
  FRAME_ZOOM_MAX,
  LEGIBLE_MARGIN,
  MIN_FIT,
  VIEW_MARGIN,
} from "./constants.js";
import containsRect from "./containsRect.js";
import frameRegionWindow from "./frameRegionWindow.js";
import layOutClassGraph from "./layOutClassGraph.js";

/** The canvases of the desktops the browser tests open, on screen. */
const CANVASES = [
  { w: 590, h: 778 },
  { w: 880, h: 700 },
  { w: 760, h: 540 },
  { w: 1000, h: 470 },
];

describe("frameRegionWindow", () => {
  for (const [name, input] of [
    ["the docs site's four namespaces", FOUR_NAMESPACE_GRAPH],
    ["the metro", metroGraph],
  ] as const) {
    const layout = layOutClassGraph(input, { budget: GRAPH_BUDGET });
    const boxes: Rect[] = [
      ...[...layout.nodes.values()].map(({ x, y, w, h }) => ({ x, y, w, h })),
      ...layout.regions.map((region) => ({
        x: region.x,
        y: region.y,
        w: measureRegionLabelWidth(region.prefix, region.ids.length),
        h: REGION_LABEL_ROW,
      })),
    ];

    it(`frames every region of ${name} whole and legible, cutting no box`, () => {
      for (const canvas of CANVASES) {
        for (const region of layout.regions) {
          const frame = {
            x: region.x - VIEW_MARGIN,
            y: region.y - VIEW_MARGIN,
            w: region.w + 2 * VIEW_MARGIN,
            h: region.h + 2 * VIEW_MARGIN,
          };
          const window = frameRegionWindow(layout, canvas, frame, {
            wide: region.collapsed,
          });
          // A frame too large for the canvas at the legible zoom is the
          // legible window's to show.
          if (
            Math.min(canvas.w / frame.w, canvas.h / frame.h) <
            MIN_FIT * LEGIBLE_MARGIN
          ) {
            expect(window).toBeUndefined();
            continue;
          }
          if (window === undefined)
            throw new Error(`no window: ${region.prefix}`);
          expect(window.h / window.w).toBeCloseTo(canvas.h / canvas.w, 9);
          expect(containsRect(window, frame)).toBe(true);
          const zoom = canvas.w / window.w;
          expect(zoom).toBeGreaterThanOrEqual(MIN_FIT);
          expect(zoom).toBeLessThanOrEqual(FRAME_ZOOM_MAX + FIT_TOLERANCE);
          expect(
            boxes.filter(
              (box) =>
                intersectsRect(window, box) && !containsRect(window, box),
            ),
          ).toEqual([]);
        }
      }
    });
  }

  it("frames a box among its neighbours, an open region as large as it fits", () => {
    const layout = layOutClassGraph(FOUR_NAMESPACE_GRAPH, {
      budget: GRAPH_BUDGET,
    });
    const canvas = { w: 880, h: 700 };
    const frameOf = (prefix: string) => {
      const region = layout.regions.find(
        (candidate) => candidate.prefix === prefix,
      );
      if (region === undefined) throw new Error(prefix);
      return {
        x: region.x - VIEW_MARGIN,
        y: region.y - VIEW_MARGIN,
        w: region.w + 2 * VIEW_MARGIN,
        h: region.h + 2 * VIEW_MARGIN,
      };
    };
    const ds = frameRegionWindow(layout, canvas, frameOf("ds"), {
      wide: true,
    });
    // The widest legible window, holding more than ds's lone box.
    expect(ds?.w).toBeCloseTo(canvas.w / MIN_FIT, 2);
    expect(
      [...layout.nodes.values()].filter((node) => ds && containsRect(ds, node))
        .length,
    ).toBeGreaterThan(1);
    const anatomy = frameOf("anatomy");
    const open = frameRegionWindow(layout, canvas, anatomy);
    // Anatomy's frame alone fits the canvas past the legible zoom, so its
    // window is at most a few lattice steps wider than the frame needs.
    expect(open?.w).toBeLessThan(
      Math.max(anatomy.w, (anatomy.h * canvas.w) / canvas.h) + 16 * 8,
    );
  });

  it("gives no window when every window would cut a box", () => {
    // A box straddles the frame's right side at every legible width.
    const node = {
      ...[...layOutClassGraph(FOUR_NAMESPACE_GRAPH).nodes.values()][0],
      x: 90,
      y: 0,
      w: 60,
      h: 10,
    };
    expect(
      frameRegionWindow(
        { nodes: new Map([["straddling", node]]), regions: [] },
        { w: 100, h: 100 },
        { x: 0, y: 0, w: 100, h: 100 },
      ),
    ).toBeUndefined();
  });

  it("gives no window for a frame too large for the canvas at the legible zoom", () => {
    const layout = layOutClassGraph(FOUR_NAMESPACE_GRAPH);
    expect(
      frameRegionWindow(
        layout,
        { w: 200, h: 200 },
        { x: 0, y: 0, w: 1000, h: 1000 },
      ),
    ).toBeUndefined();
  });
});
