import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  UseWindowFitmentOptions,
  WindowFitmentPlacement,
  WindowFitmentSide,
} from "./types.js";
import useWindowFitment from "./useWindowFitment.js";

/** A DOMRect stand-in. */
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

describe("useWindowFitment", () => {
  afterEach(() => {
    document.documentElement.dir = "";
    vi.restoreAllMocks();
  });

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

  /**
   * Places a 200x100 popup against a 100x40 target in jsdom's 1024x768
   * window, and returns the hook's result.
   */
  const place = (
    props: UseWindowFitmentOptions,
    targetRect = makeRect(500, 300, 100, 40),
    popupRect = makeRect(0, 0, 200, 100),
  ) => {
    const target = document.createElement("button");
    const popup = document.createElement("div");
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(targetRect);
    vi.spyOn(popup, "getBoundingClientRect").mockReturnValue(popupRect);
    const view = renderHook((current) => useWindowFitment(current), {
      initialProps: { direction: "ltr", ...props } as UseWindowFitmentOptions,
    });
    view.result.current.targetRef.current = target;
    view.result.current.popupRef.current = popup;
    view.rerender({ direction: "ltr", ...props, isOpen: true });
    return view;
  };

  it.each([
    [{ side: "block-end", align: "start" }, "bottom", { top: 340, left: 500 }],
    [{ side: "block-end", align: "end" }, "bottom", { top: 340, left: 400 }],
    ["block-end", "bottom", { top: 340, left: 450 }],
    ["block-start", "top", { top: 192, left: 450 }],
    ["inline-end", "right", { top: 270, left: 600 }],
    ["inline-start", "left", { top: 270, left: 292 }],
  ] as const)(
    "places %j on the %s side, at its alignment",
    (placement, side, position) => {
      const { result } = place({
        preferredDirections: [
          placement as WindowFitmentSide | WindowFitmentPlacement,
        ],
        distance: "8px",
      });
      expect(result.current.bestPosition).toMatchObject({
        positionName: side,
        fits: true,
        position,
      });
    },
  );

  it.each([
    ["block-end", "marginTop"],
    ["block-start", "marginBottom"],
    ["inline-end", "marginLeft"],
    ["inline-start", "marginRight"],
  ] as const)(
    "keeps the distance as a margin away from the target on %s",
    (side, margin) => {
      const { result } = place({
        preferredDirections: [side],
        distance: "8px",
      });
      expect(result.current.popupPositionStyle).toMatchObject({
        [margin]: "8px",
      });
    },
  );

  it("takes the first side that fits, and tells the consumer", () => {
    const onBestPositionChange = vi.fn();
    const { result } = place(
      {
        preferredDirections: ["block-start", "block-end"],
        onBestPositionChange,
      },
      makeRect(500, 20, 100, 40),
    );
    expect(result.current.bestPosition?.positionName).toBe("bottom");
    expect(onBestPositionChange).toHaveBeenCalledWith(
      expect.objectContaining({ positionName: "bottom" }),
    );
  });

  it("falls back to the first side, unclamped, when none fits", () => {
    const { result } = place(
      { preferredDirections: ["block-start", "inline-start"] },
      makeRect(0, 0, 20, 20),
      makeRect(0, 0, 100, 100),
    );
    expect(result.current.bestPosition).toMatchObject({
      positionName: "top",
      fits: false,
      position: { top: -100, left: -40 },
      autoFitOffset: { top: 0, left: 0 },
    });
  });

  it("clamps into the top and left bounds with autoFit, keeping the first of equal clamps", () => {
    const { result } = place(
      { preferredDirections: ["block-start", "inline-start"], autoFit: true },
      makeRect(0, 0, 20, 20),
      makeRect(0, 0, 100, 100),
    );
    expect(result.current.bestPosition).toMatchObject({
      positionName: "top",
      fits: false,
      position: { top: 0, left: 0 },
      autoFitOffset: { top: 100, left: -40 },
    });
  });

  it("clamps into the bottom and right bounds with autoFit, taking the least-clamped side", () => {
    const { result } = place(
      { preferredDirections: ["inline-end", "block-end"], autoFit: true },
      makeRect(1000, 700, 20, 20),
      makeRect(0, 0, 100, 100),
    );
    expect(result.current.bestPosition).toMatchObject({
      positionName: "bottom",
      fits: false,
      position: { top: 668, left: 924 },
      autoFitOffset: { top: -52, left: 36 },
    });
  });

  it("clamps only the axis that overflows", () => {
    const { result } = place(
      { preferredDirections: ["block-end"], autoFit: true },
      makeRect(500, 700, 20, 20),
      makeRect(0, 0, 100, 100),
    );
    expect(result.current.bestPosition).toMatchObject({
      position: { top: 668, left: 460 },
      autoFitOffset: { top: -52, left: 0 },
    });
  });

  it("refuses an empty list of preferred directions", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => place({ preferredDirections: [] })).toThrow(
      "Preferred directions must not be empty.",
    );
    error.mockRestore();
  });

  it("re-resolves when the document's dir flips, without a direction prop", async () => {
    const { result, unmount } = renderHook(() => useWindowFitment({}));
    expect(result.current.direction).toBe("ltr");
    document.documentElement.dir = "rtl";
    await waitFor(() => expect(result.current.direction).toBe("rtl"));
    unmount();
  });
});
