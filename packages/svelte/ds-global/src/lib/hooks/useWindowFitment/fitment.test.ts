import { describe, expect, it } from "vitest";
import {
  calculateRelativePosition,
  computeArrowOffset,
  computeBounds,
  fakeMarginProperty,
  findBestPosition,
  fitsInWindow,
  readHtmlDirection,
  resolveLogicalPlacement,
  toPlacement,
} from "./fitment.js";

/** Build a minimal DOMRect-like object for the fields computeArrowOffset reads. */
const makeRect = (
  left: number,
  top: number,
  width: number,
  height: number,
): DOMRect =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

describe("toPlacement", () => {
  it("coerces a bare logical side to a centred placement", () => {
    expect(toPlacement("inline-end")).toEqual({
      side: "inline-end",
      align: "center",
    });
    expect(toPlacement("block-start")).toEqual({
      side: "block-start",
      align: "center",
    });
  });

  it("passes a placement object through unchanged", () => {
    const placement = { side: "inline-end", align: "start" } as const;
    expect(toPlacement(placement)).toBe(placement);
  });
});

describe("resolveLogicalPlacement", () => {
  it("maps the inline axis by reading direction, block axis dir-invariant (LTR)", () => {
    const ltr = (side: Parameters<typeof toPlacement>[0]) =>
      resolveLogicalPlacement(toPlacement(side), "ltr").direction;
    expect(ltr("inline-start")).toBe("left");
    expect(ltr("inline-end")).toBe("right");
    expect(ltr("block-start")).toBe("top");
    expect(ltr("block-end")).toBe("bottom");
  });

  it("mirrors the inline axis in RTL, leaves the block axis untouched", () => {
    const rtl = (side: Parameters<typeof toPlacement>[0]) =>
      resolveLogicalPlacement(toPlacement(side), "rtl").direction;
    expect(rtl("inline-start")).toBe("right");
    expect(rtl("inline-end")).toBe("left");
    expect(rtl("block-start")).toBe("top");
    expect(rtl("block-end")).toBe("bottom");
  });

  it("passes the alignment through unmodified on an inline side", () => {
    expect(
      resolveLogicalPlacement({ side: "inline-end", align: "end" }, "ltr"),
    ).toEqual({ direction: "right", align: "end" });
    // An inline side's cross-axis is vertical, so alignment is dir-blind.
    expect(
      resolveLogicalPlacement({ side: "inline-end", align: "end" }, "rtl"),
    ).toEqual({ direction: "left", align: "end" });
  });

  it("mirrors start/end alignment on a block side in RTL", () => {
    // A block side's cross-axis is the READING axis, so `start` is the leading
    // edge: left in LTR, right in RTL. `end` is its counterpart.
    expect(
      resolveLogicalPlacement({ side: "block-end", align: "start" }, "ltr"),
    ).toEqual({ direction: "bottom", align: "start" });
    expect(
      resolveLogicalPlacement({ side: "block-end", align: "start" }, "rtl"),
    ).toEqual({ direction: "bottom", align: "end" });
    expect(
      resolveLogicalPlacement({ side: "block-start", align: "end" }, "rtl"),
    ).toEqual({ direction: "top", align: "start" });
  });

  it("leaves centre alignment alone on a block side in RTL", () => {
    // `center` is its own mirror.
    expect(
      resolveLogicalPlacement({ side: "block-end", align: "center" }, "rtl"),
    ).toEqual({ direction: "bottom", align: "center" });
  });

  it("headline: a leading-edge, top-aligned placement mirrors for free", () => {
    const placement = { side: "inline-end", align: "start" } as const;
    // LTR leading edge is the right; RTL leading edge is the left.
    expect(resolveLogicalPlacement(placement, "ltr")).toEqual({
      direction: "right",
      align: "start",
    });
    expect(resolveLogicalPlacement(placement, "rtl")).toEqual({
      direction: "left",
      align: "start",
    });
  });
});

describe("computeArrowOffset", () => {
  it("returns zero on the x axis when a top/bottom popup is centred on the target", () => {
    // Target centre x = 150; popup centre x = 150 → aligned.
    const target = makeRect(100, 0, 100, 20);
    const popup = makeRect(50, 30, 200, 40);

    expect(computeArrowOffset("bottom", target, popup)).toEqual({
      axis: "x",
      offset: 0,
    });
    expect(computeArrowOffset("top", target, popup)).toEqual({
      axis: "x",
      offset: 0,
    });
  });

  it("shifts the arrow toward a target left of the popup centre", () => {
    // Target centre x = 60; popup centre x = 150 → arrow shifts -90.
    const target = makeRect(40, 0, 40, 20);
    const popup = makeRect(50, 30, 200, 40);

    expect(computeArrowOffset("bottom", target, popup)).toEqual({
      axis: "x",
      offset: -90,
    });
  });

  it("shifts the arrow toward a target right of the popup centre", () => {
    // Target centre x = 240; popup centre x = 150 → arrow shifts +90.
    const target = makeRect(220, 0, 40, 20);
    const popup = makeRect(50, 30, 200, 40);

    expect(computeArrowOffset("bottom", target, popup)).toEqual({
      axis: "x",
      offset: 90,
    });
  });

  it("clamps the offset to the popup half-extent so the arrow stays on the edge", () => {
    // Target centre x = 500; popup centre x = 150; raw offset 350, half-extent 100.
    const target = makeRect(480, 0, 40, 20);
    const popup = makeRect(50, 30, 200, 40);

    expect(computeArrowOffset("bottom", target, popup)).toEqual({
      axis: "x",
      offset: 100,
    });
  });

  it("uses the y axis for left/right placements", () => {
    // Target centre y = 100; popup centre y = 60 → arrow shifts +40 on y.
    const target = makeRect(0, 80, 20, 40);
    const popup = makeRect(30, 10, 40, 100);

    expect(computeArrowOffset("right", target, popup)).toEqual({
      axis: "y",
      offset: 40,
    });
    expect(computeArrowOffset("left", target, popup)).toEqual({
      axis: "y",
      offset: 40,
    });
  });

  it("centres the arrow from the authoritative position, not the stale rect", () => {
    // Regression: when attached to an anchor, the popup's live rect lags one
    // frame behind the just-computed placement. The rect here still says the
    // popup is at left=0 (its old spot), but the authoritative position places
    // it at left=50 (popup centre x = 150, matching the target centre) — so the
    // offset must be 0, computed from the authoritative position, not -50 from
    // the stale rect.
    const target = makeRect(100, 0, 100, 20); // centre x = 150
    const staleRect = makeRect(0, 30, 200, 40); // stale left → centre x = 100
    const authoritative = { top: 30, left: 50 }; // real left → centre x = 150

    expect(
      computeArrowOffset("bottom", target, staleRect, authoritative),
    ).toEqual({ axis: "x", offset: 0 });

    // Without the authoritative position it would use the stale rect and drift.
    expect(computeArrowOffset("bottom", target, staleRect)).toEqual({
      axis: "x",
      offset: 50,
    });
  });
});

describe("readHtmlDirection", () => {
  it("defaults to ltr without a document", () => {
    expect(readHtmlDirection()).toBe("ltr");
  });
});

describe("computeBounds", () => {
  it("insets the window by a single gutter on every side", () => {
    expect(computeBounds("10px", 800, 600)).toEqual({
      top: 10,
      left: 10,
      right: 790,
      bottom: 590,
    });
  });

  it("reads the gutter like CSS padding shorthand", () => {
    expect(computeBounds("10px 20px", 800, 600)).toEqual({
      top: 10,
      left: 20,
      right: 780,
      bottom: 590,
    });
    expect(computeBounds("10px 20px 30px 40px", 800, 600)).toEqual({
      top: 10,
      left: 40,
      right: 780,
      bottom: 570,
    });
  });

  it("treats an unparsable gutter as none", () => {
    expect(computeBounds("auto", 800, 600)).toEqual({
      top: 0,
      left: 0,
      right: 800,
      bottom: 600,
    });
  });
});

describe("calculateRelativePosition", () => {
  const target = makeRect(100, 100, 40, 20);
  const popup = makeRect(0, 0, 100, 30);

  it("places the popup above, centred, past the distance", () => {
    expect(
      calculateRelativePosition("top", "center", target, popup, 8),
    ).toEqual({ left: -30, top: -38 });
  });

  it("places the popup below, aligned to the start or end", () => {
    expect(
      calculateRelativePosition("bottom", "start", target, popup, 8),
    ).toEqual({ left: 0, top: 20 });
    expect(
      calculateRelativePosition("bottom", "end", target, popup, 8),
    ).toEqual({ left: -60, top: 20 });
  });

  it("places the popup to either side, aligned on the vertical axis", () => {
    expect(
      calculateRelativePosition("right", "center", target, popup, 8),
    ).toEqual({ left: 40, top: -5 });
    expect(
      calculateRelativePosition("left", "start", target, popup, 8),
    ).toEqual({ left: -108, top: 0 });
  });
});

describe("fitsInWindow", () => {
  const bounds = { top: 0, left: 0, right: 200, bottom: 200 };
  const popup = makeRect(0, 0, 50, 50);

  it("accepts a position inside the bounds", () => {
    expect(fitsInWindow({ top: 10, left: 10 }, popup, bounds)).toBe(true);
  });

  it.each([
    [{ top: -1, left: 10 }],
    [{ top: 10, left: -1 }],
    [{ top: 151, left: 10 }],
    [{ top: 10, left: 151 }],
  ])("rejects a position past an edge (%o)", (position) => {
    expect(fitsInWindow(position, popup, bounds)).toBe(false);
  });
});

describe("findBestPosition", () => {
  const bounds = { top: 0, left: 0, right: 400, bottom: 400 };
  const popup = makeRect(0, 0, 100, 50);

  it("takes the first placement that fits", () => {
    const target = makeRect(150, 10, 40, 20);
    const best = findBestPosition(
      target,
      popup,
      [
        { direction: "top", align: "center" },
        { direction: "bottom", align: "center" },
      ],
      { distance: 0, bounds, autoFit: false },
    );
    expect(best).toEqual({
      positionName: "bottom",
      align: "center",
      position: { top: 30, left: 120 },
      fits: true,
      autoFitOffset: { top: 0, left: 0 },
    });
  });

  it("falls back to the first placement when none fits and auto-fit is off", () => {
    const target = makeRect(0, 0, 400, 400);
    const best = findBestPosition(
      target,
      popup,
      [
        { direction: "top", align: "center" },
        { direction: "bottom", align: "center" },
      ],
      { distance: 0, bounds, autoFit: false },
    );
    expect(best).toMatchObject({ positionName: "top", fits: false });
  });

  it("clamps into bounds and keeps the least-clamped fallback with auto-fit", () => {
    const target = makeRect(370, 10, 20, 20);
    const best = findBestPosition(
      target,
      popup,
      [
        { direction: "top", align: "center" },
        { direction: "right", align: "center" },
        { direction: "left", align: "center" },
      ],
      { distance: 0, bounds: { ...bounds, right: 380 }, autoFit: true },
    );
    expect(best).toMatchObject({
      positionName: "left",
      fits: false,
      position: { top: 0, left: 270 },
      autoFitOffset: { top: 5, left: 0 },
    });
  });

  it("clamps a popup that overflows the bottom or the left edge", () => {
    const tall = makeRect(0, 0, 100, 380);
    const best = findBestPosition(
      makeRect(10, 100, 20, 20),
      tall,
      [{ direction: "bottom", align: "center" }],
      { distance: 0, bounds, autoFit: true },
    );
    expect(best).toMatchObject({
      position: { top: 20, left: 0 },
      autoFitOffset: { top: -100, left: -30 },
    });
  });

  it("throws without placements", () => {
    expect(() =>
      findBestPosition(makeRect(0, 0, 1, 1), popup, [], {
        distance: 0,
        bounds,
        autoFit: false,
      }),
    ).toThrow("Preferred directions must not be empty.");
  });
});

describe("fakeMarginProperty", () => {
  it.each([
    ["top", "margin-bottom"],
    ["bottom", "margin-top"],
    ["left", "margin-right"],
    ["right", "margin-left"],
    [undefined, "margin-top"],
  ] as const)("puts the margin of a %s popup on its %s", (side, expected) => {
    expect(fakeMarginProperty(side)).toBe(expected);
  });
});
