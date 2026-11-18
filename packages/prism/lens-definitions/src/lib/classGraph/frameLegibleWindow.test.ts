import {
  LATTICE,
  measureRegionLabelWidth,
  REGION_LABEL_ROW,
  type Rect,
  requireDefined,
  requireEntry,
} from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import createClassGraphSetup from "../../../testing/createClassGraphSetup.js";
import { CROSS_REGION_GRAPH } from "../../../testing/fixtures.js";
import { FIT_TOLERANCE, MIN_FIT } from "./constants.js";
import containsRect from "./containsRect.js";
import frameLegibleWindow from "./frameLegibleWindow.js";
import layOutClassGraph from "./layOutClassGraph.js";

const { layout, uris } = createClassGraphSetup();

/** The canvases the well takes at common viewports, in px. */
const CANVASES = [
  { w: 590.67, h: 778 },
  { w: 590.67, h: 658 },
  { w: 632, h: 546 },
  { w: 504, h: 570 },
];

/** Every box the window must not cut: the classes and the region labels. */
const OBSTACLES: readonly Rect[] = [
  ...layout.nodes.values(),
  ...layout.regions.map((region) => ({
    x: region.x,
    y: region.y,
    w: measureRegionLabelWidth(region.prefix, region.ids.length),
    h: REGION_LABEL_ROW,
  })),
];

/** The zoom a window opens at on a canvas. */
const zoomOf = (canvas: { w: number; h: number }, window: Rect): number =>
  Math.min(canvas.w / window.w, canvas.h / window.h);

/**
 * The boxes a window cuts with its left, top or right edge: every box in
 * view lies wholly in it, but for those its bottom edge crosses within its
 * width.
 */
const findSideCuts = (window: Rect): Rect[] =>
  OBSTACLES.filter((box) => {
    const right = window.x + window.w;
    const bottom = window.y + window.h;
    const inView =
      box.x < right &&
      window.x < box.x + box.w &&
      box.y < bottom &&
      window.y < box.y + box.h;
    const inside = containsRect(window, box);
    const openBelow =
      box.y >= window.y &&
      box.x + box.w <= right + FIT_TOLERANCE &&
      box.y + box.h > bottom;
    return inView && !inside && !openBelow;
  });

describe("frameLegibleWindow", () => {
  it("is the whole viewBox on a canvas it fits at the legible zoom", () => {
    expect(frameLegibleWindow(layout, { w: 1200, h: 1400 })).toBe(
      layout.viewBox,
    );
  });

  it.each(CANVASES)(
    "opens a $w by $h canvas legibly, from the top-left, cutting no box on its left, top or right",
    (canvas) => {
      const window = frameLegibleWindow(layout, canvas);
      expect(window).toMatchObject({
        x: layout.viewBox.x,
        y: layout.viewBox.y,
      });
      expect(window.h / window.w).toBeCloseTo(canvas.h / canvas.w, 10);
      expect(zoomOf(canvas, window)).toBeGreaterThanOrEqual(MIN_FIT);
      expect(findSideCuts(window)).toEqual([]);
    },
  );

  it.each(CANVASES)(
    "opens a $w by $h canvas around the class selected on arrival, holding it whole at the legible floor or above",
    (canvas) => {
      const arrival = requireEntry(
        layout.nodes,
        requireEntry(uris, "ds:UIBlock"),
      );
      const window = frameLegibleWindow(layout, canvas, { arrival });
      expect(zoomOf(canvas, window)).toBeGreaterThanOrEqual(MIN_FIT);
      expect(window.x).toBeLessThanOrEqual(arrival.x);
      expect(window.x + window.w).toBeGreaterThanOrEqual(arrival.x + arrival.w);
      expect(window.y).toBeLessThanOrEqual(arrival.y);
      expect(window.y + window.h).toBeGreaterThanOrEqual(arrival.y + arrival.h);
    },
  );

  it("opens around a class centred in the legible window, clamped to the map", () => {
    const frame = layout.viewBox;
    for (const canvas of CANVASES) {
      for (const term of ["ds:UIBlock", "cs:CodeStandard", "anatomy:Node"]) {
        const arrival = requireEntry(layout.nodes, requireEntry(uris, term));
        const window = frameLegibleWindow(layout, canvas, { arrival });
        const name = `${term} ${canvas.w}`;
        expect(zoomOf(canvas, window), name).toBeCloseTo(MIN_FIT, 5);
        expect(containsRect(window, arrival), name).toBe(true);
        // On each axis: centred on the class, unless that would show past
        // the map's edge, where the window keeps to the map.
        for (const [at, size, span, start, room] of [
          [arrival.x, arrival.w, window.w, frame.x, frame.w],
          [arrival.y, arrival.h, window.h, frame.y, frame.h],
        ] as const) {
          const from = at === arrival.x ? window.x : window.y;
          if (span >= room) {
            expect(from + span / 2, name).toBeCloseTo(start + room / 2, 6);
            continue;
          }
          expect(from, name).toBeGreaterThanOrEqual(start - 1e-6);
          expect(from + span, name).toBeLessThanOrEqual(start + room + 1e-6);
          const centred = Math.abs(from + span / 2 - (at + size / 2)) < 1e-6;
          const clamped =
            Math.abs(from - start) < 1e-6 ||
            Math.abs(from + span - (start + room)) < 1e-6;
          expect(centred || clamped, name).toBe(true);
        }
      }
    }
  });

  it("centres the legible window on a class on a canvas too small for any clean window", () => {
    const canvas = { w: 40, h: 40 };
    const arrival = requireEntry(
      layout.nodes,
      requireEntry(uris, "ds:UIBlock"),
    );
    const window = frameLegibleWindow(layout, canvas, { arrival });
    expect(zoomOf(canvas, window)).toBeCloseTo(MIN_FIT, 5);
    expect(window.x + window.w / 2).toBeCloseTo(arrival.x + arrival.w / 2, 6);
    expect(window.y + window.h / 2).toBeCloseTo(arrival.y + arrival.h / 2, 6);
  });

  it("zooms one step further to keep its bottom edge out of every box too", () => {
    const window = frameLegibleWindow(layout, { w: 590.67, h: 658 });
    const bottom = window.y + window.h;
    expect(
      OBSTACLES.filter(
        (box) =>
          box.x < window.x + window.w &&
          box.y < bottom &&
          box.y + box.h > bottom,
      ),
    ).toEqual([]);
  });

  it("puts its bottom edge in the gap above a box no wider window clears", () => {
    // A small box at the top-left and, below it, a box wider than any
    // legible window, which the bottom edge may neither cross nor hold: the
    // widest window that clears it ends half a lattice step above it.
    const [small, wide] = [
      ...layOutClassGraph(CROSS_REGION_GRAPH).nodes.values(),
    ];
    const nodes = new Map([
      [
        "small",
        { ...requireDefined(small, "a class"), x: 16, y: 16, w: 32, h: 32 },
      ],
      [
        "wide",
        { ...requireDefined(wide, "a class"), x: 0, y: 104, w: 200, h: 32 },
      ],
    ]);
    const viewBox = { x: 0, y: 0, w: 240, h: 160 };
    const window = frameLegibleWindow(
      { nodes, regions: [], viewBox },
      { w: 120, h: 120 },
    );
    expect(window).toEqual({ x: 0, y: 0, w: 96, h: 96 });
    expect(window.y + window.h).toBe(
      requireEntry(nodes, "wide").y - LATTICE / 2,
    );
  });

  it("frames a box it is given whole where it fits legibly, and else from its corner", () => {
    const region = requireDefined(
      layout.regions.find((candidate) => candidate.prefix === "cs"),
      "the cs region",
    );
    expect(
      frameLegibleWindow(layout, { w: 1200, h: 1400 }, { within: region }),
    ).toBe(region);
    const ds = requireDefined(
      layout.regions.find((candidate) => candidate.prefix === "ds"),
      "the ds region",
    );
    const within = { x: ds.x - 16, y: ds.y - 16, w: ds.w + 32, h: ds.h + 32 };
    const canvas = { w: 590.67, h: 778 };
    const window = frameLegibleWindow(layout, canvas, { within });
    expect(window).toMatchObject({ x: within.x, y: within.y });
    expect(zoomOf(canvas, window)).toBeGreaterThanOrEqual(MIN_FIT);
    expect(findSideCuts(window)).toEqual([]);
  });

  it("falls back to the legible window on a canvas too small to hold a box", () => {
    const canvas = { w: 40, h: 40 };
    const window = frameLegibleWindow(layout, canvas);
    expect(zoomOf(canvas, window)).toBeCloseTo(MIN_FIT, 5);
    expect(window).toMatchObject({ x: layout.viewBox.x, y: layout.viewBox.y });
  });
});
