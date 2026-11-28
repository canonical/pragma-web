import { flushSync } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { UseWindowFitmentProps } from "./index.js";
import { useWindowFitment } from "./index.js";

/** A fixed-position box in the document. */
const box = (left: number, top: number, width: number, height: number) => {
  const element = document.createElement("div");
  element.style.cssText = `position: fixed; left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px;`;
  document.body.append(element);
  return element;
};

/** Runs the hook in an effect root, with reactive props and elements. */
const setup = (initial: UseWindowFitmentProps = {}) => {
  const state = $state({
    props: initial,
    target: undefined as HTMLElement | undefined,
    popup: undefined as HTMLElement | undefined,
  });
  let fitment!: ReturnType<typeof useWindowFitment>;
  const destroy = $effect.root(() => {
    fitment = useWindowFitment(() => state.props, {
      get target() {
        return state.target;
      },
      get popup() {
        return state.popup;
      },
    });
  });
  flushSync();
  return { state, fitment, destroy };
};

describe("useWindowFitment", () => {
  afterEach(() => {
    document.body.replaceChildren();
    document.documentElement.removeAttribute("dir");
  });

  it("has no position until both elements are attached", () => {
    const { state, fitment, destroy } = setup();
    expect(fitment.bestPosition).toBeUndefined();
    expect(fitment.arrowOffset).toBeUndefined();
    expect(fitment.popupPositionStyle).toBe(
      "max-width: 350px; top: 0px; left: 0px; margin-top: 0px",
    );
    state.target = box(200, 200, 40, 20);
    flushSync();
    expect(fitment.bestPosition).toBeUndefined();
    destroy();
  });

  it("places the popup on the first preferred side that fits", () => {
    const { state, fitment, destroy } = setup({
      preferredDirections: ["block-end"],
      distance: "8px",
      maxWidth: "200px",
    });
    state.target = box(200, 200, 40, 20);
    state.popup = box(0, 0, 100, 30);
    flushSync();
    expect(fitment.bestPosition).toEqual({
      positionName: "bottom",
      align: "center",
      position: { top: 220, left: 170 },
      fits: true,
      autoFitOffset: { top: 0, left: 0 },
    });
    expect(fitment.popupPositionStyle).toBe(
      "max-width: 200px; top: 220px; left: 170px; margin-top: 8px",
    );
    expect(fitment.arrowOffset).toEqual({ axis: "x", offset: 0 });
    destroy();
  });

  it("defaults to block-start, centred", () => {
    const { state, fitment, destroy } = setup();
    state.target = box(200, 200, 40, 20);
    state.popup = box(0, 0, 100, 30);
    flushSync();
    expect(fitment.bestPosition).toMatchObject({
      positionName: "top",
      align: "center",
      fits: true,
    });
    destroy();
  });

  it("re-reads the target geometry when the popup opens", () => {
    const target = box(20, 10, 10, 10);
    const { state, fitment, destroy } = setup({
      preferredDirections: ["block-end"],
      isOpen: false,
    });
    state.target = target;
    state.popup = box(0, 0, 10, 10);
    flushSync();
    expect(fitment.bestPosition?.position).toEqual({ top: 20, left: 20 });

    // The target moved without changing size; opening must re-measure.
    target.style.top = "140px";
    state.props = { ...state.props, isOpen: true };
    flushSync();
    expect(fitment.bestPosition?.position).toEqual({ top: 150, left: 20 });
    destroy();
  });

  it("resolves logical sides against the document direction", async () => {
    const { state, fitment, destroy } = setup({
      preferredDirections: ["inline-start"],
    });
    state.target = box(200, 200, 40, 20);
    state.popup = box(0, 0, 100, 30);
    flushSync();
    expect(fitment.direction).toBe("ltr");
    expect(fitment.bestPosition?.positionName).toBe("left");

    document.documentElement.dir = "rtl";
    await expect.poll(() => fitment.direction).toBe("rtl");
    expect(fitment.bestPosition?.positionName).toBe("right");
    destroy();
  });

  it("honours a direction override", () => {
    const { state, fitment, destroy } = setup({
      preferredDirections: ["inline-end"],
      direction: "rtl",
    });
    state.target = box(200, 200, 40, 20);
    state.popup = box(0, 0, 100, 30);
    flushSync();
    expect(fitment.direction).toBe("rtl");
    expect(fitment.bestPosition?.positionName).toBe("left");
    expect(fitment.popupPositionStyle).toContain("margin-right: 0px");
    destroy();
  });

  it("notifies when the placement side changes", () => {
    const onbestpositionchange = vi.fn();
    const { state, destroy } = setup({
      preferredDirections: ["block-start"],
      onbestpositionchange,
    });
    expect(onbestpositionchange).not.toHaveBeenCalled();
    state.target = box(200, 200, 40, 20);
    state.popup = box(0, 0, 100, 30);
    flushSync();
    expect(onbestpositionchange).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ positionName: "top" }),
    );

    state.props = { ...state.props, preferredDirections: ["inline-end"] };
    flushSync();
    expect(onbestpositionchange).toHaveBeenCalledTimes(2);
    expect(onbestpositionchange).toHaveBeenLastCalledWith(
      expect.objectContaining({ positionName: "right" }),
    );
    destroy();
  });

  it("points the arrow at the target when auto-fit clamps the popup", () => {
    const { state, fitment, destroy } = setup({
      preferredDirections: ["block-end"],
      autoFit: true,
    });
    state.target = box(0, 200, 20, 20);
    state.popup = box(0, 0, 100, 30);
    flushSync();
    expect(fitment.bestPosition).toMatchObject({
      fits: false,
      position: { top: 220, left: 0 },
    });
    expect(fitment.arrowOffset).toEqual({ axis: "x", offset: -40 });
    destroy();
  });
});
