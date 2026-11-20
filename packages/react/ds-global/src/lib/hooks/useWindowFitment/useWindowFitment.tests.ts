import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { WindowFitmentSide } from "./types.js";
import useWindowFitment, { computeArrowOffset } from "./useWindowFitment.js";

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

describe("useWindowFitment", () => {
  it("recomputes bestPosition when isOpen becomes true with a stable preferredDirections array and 0x0 rects", () => {
    const preferredDirections: readonly WindowFitmentSide[] = ["block-end"];
    const { result, rerender } = renderHook(
      ({ isOpen }) => useWindowFitment({ preferredDirections, isOpen }),
      { initialProps: { isOpen: false } },
    );

    expect(result.current.bestPosition).toBeUndefined();

    // Simulate a deferred portal mounting while closed in a 0x0 environment
    // (such as jsdom, where ResizeObserver does not fire a size delta).
    result.current.targetRef.current = document.createElement("button");
    result.current.popupRef.current = document.createElement("div");

    rerender({ isOpen: true });

    expect(result.current.bestPosition).toMatchObject({
      positionName: "bottom",
      align: "center",
      fits: true,
    });
  });

  it("recomputes bestPosition when isOpen becomes true with omitted preferredDirections and 0x0 rects", () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) => useWindowFitment({ isOpen }),
      { initialProps: { isOpen: false } },
    );

    expect(result.current.bestPosition).toBeUndefined();

    result.current.targetRef.current = document.createElement("button");
    result.current.popupRef.current = document.createElement("div");

    rerender({ isOpen: true });

    expect(result.current.bestPosition).toMatchObject({
      positionName: "top",
      align: "center",
      fits: true,
    });
  });

  it("re-reads target geometry when isOpen flips to true after refs already attached", () => {
    const preferredDirections: readonly WindowFitmentSide[] = ["block-end"];
    const target = document.createElement("button");
    const popup = document.createElement("div");
    let targetTop = 10;
    vi.spyOn(target, "getBoundingClientRect").mockImplementation(() =>
      makeRect(20, targetTop, 0, 0),
    );

    const { result, rerender } = renderHook(
      ({ isOpen }) => useWindowFitment({ preferredDirections, isOpen }),
      { initialProps: { isOpen: false } },
    );

    result.current.targetRef.current = target;
    result.current.popupRef.current = popup;
    rerender({ isOpen: false });
    expect(result.current.bestPosition?.position).toEqual({
      top: 10,
      left: 20,
    });

    // Target moved on the page without changing size; opening must re-measure.
    targetTop = 140;
    rerender({ isOpen: true });
    expect(result.current.bestPosition?.position).toEqual({
      top: 140,
      left: 20,
    });
  });
});
