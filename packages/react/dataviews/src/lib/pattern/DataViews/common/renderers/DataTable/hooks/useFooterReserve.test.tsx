/**
 * The footer's reserve: the footer's measured height, written onto the
 * frame while the footer is drawn, and taken off again when it goes.
 */
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, onTestFinished, vi } from "vitest";
import {
  installResizeObserverStandIn,
  type ResizeObserverStandIn,
} from "../../../../../../../../testing/index.js";
import useFooterReserve from "./useFooterReserve.js";

const RESERVE = "--data-table-frame-footer-reserve";

/** A frame holding a footer, both committed. */
const drawFrame = () => {
  const frame = document.createElement("div");
  const footer = document.createElement("div");
  frame.append(footer);
  document.body.append(frame);
  return {
    frame,
    footer,
    frameRef: { current: frame },
    footerRef: { current: footer },
  };
};

describe("useFooterReserve", () => {
  let standIn: ResizeObserverStandIn | undefined;

  afterEach(() => {
    standIn?.uninstall();
    standIn = undefined;
    document.body.replaceChildren();
  });

  it("writes the footer's height onto the frame each time it changes", () => {
    standIn = installResizeObserverStandIn();
    const { frame, footer, frameRef, footerRef } = drawFrame();
    renderHook(() => useFooterReserve(frameRef, footerRef, true));
    expect(standIn.observing(footer)).toBe(1);
    standIn.resize(footer, 320, 41);
    expect(frame.style.getPropertyValue(RESERVE)).toBe("41px");
    standIn.resize(footer, 160, 82);
    expect(frame.style.getPropertyValue(RESERVE)).toBe("82px");
  });

  it("takes the reserve off and stops measuring when the footer goes", () => {
    standIn = installResizeObserverStandIn();
    const { frame, footer, frameRef, footerRef } = drawFrame();
    const { rerender } = renderHook(
      ({ drawn }) => useFooterReserve(frameRef, footerRef, drawn),
      { initialProps: { drawn: true } },
    );
    standIn.resize(footer, 320, 41);
    rerender({ drawn: false });
    expect(frame.style.getPropertyValue(RESERVE)).toBe("");
    expect(standIn.observing(footer)).toBe(0);
  });

  it("leaves the stylesheet's reserve where the platform has no ResizeObserver", () => {
    const { frame, frameRef, footerRef } = drawFrame();
    vi.stubGlobal("ResizeObserver", undefined);
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });
    expect(() =>
      renderHook(() => useFooterReserve(frameRef, footerRef, true)),
    ).not.toThrow();
    expect(frame.style.getPropertyValue(RESERVE)).toBe("");
  });

  it("measures nothing without a drawn footer", () => {
    standIn = installResizeObserverStandIn();
    const { frame, footer, frameRef } = drawFrame();
    renderHook(() => useFooterReserve(frameRef, { current: null }, true));
    renderHook(() => useFooterReserve(frameRef, { current: footer }, false));
    expect(standIn.observing(footer)).toBe(0);
    expect(frame.style.getPropertyValue(RESERVE)).toBe("");
  });
});
