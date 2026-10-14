import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useTimelineExpansion from "./useTimelineExpansion.js";

describe("useTimelineExpansion", () => {
  it("hides nothing on a page shorter than the events shown at first", () => {
    const { result } = renderHook(() =>
      useTimelineExpansion({ count: 10, initialVisible: 60 }),
    );
    expect(result.current).toMatchObject({
      topCount: 0,
      bottomCount: 10,
      hiddenCount: 0,
      indicatorPosition: null,
    });
  });

  it("shows the first 8 events and reveals 4 at a time by default", () => {
    const { result } = renderHook(() => useTimelineExpansion({ count: 20 }));
    expect(result.current).toMatchObject({
      bottomCount: 8,
      hiddenCount: 12,
      indicatorPosition: "bottom",
      step: 4,
    });
  });

  it("collapses below the first events by default", () => {
    const { result } = renderHook(() =>
      useTimelineExpansion({ count: 100, initialVisible: 60, step: 20 }),
    );
    expect(result.current).toMatchObject({
      topCount: 0,
      bottomCount: 60,
      hiddenCount: 40,
      indicatorPosition: "bottom",
    });
  });

  it("reveals one step on each show more, up to the whole page", () => {
    const { result } = renderHook(() =>
      useTimelineExpansion({ count: 100, initialVisible: 60, step: 20 }),
    );
    act(() => result.current.showMore());
    expect(result.current).toMatchObject({ bottomCount: 80, hiddenCount: 20 });
    act(() => result.current.showMore());
    act(() => result.current.showMore());
    expect(result.current).toMatchObject({
      bottomCount: 100,
      hiddenCount: 0,
      indicatorPosition: null,
    });
  });

  it("reveals every event on show all", () => {
    const { result } = renderHook(() =>
      useTimelineExpansion({ count: 100, initialVisible: 60, step: 20 }),
    );
    act(() => result.current.showAll());
    expect(result.current).toMatchObject({ bottomCount: 100, hiddenCount: 0 });
  });

  it("shows the first and last halves of the events under the middle method", () => {
    const { result } = renderHook(() =>
      useTimelineExpansion({
        count: 100,
        method: "middle",
        initialVisible: 60,
        step: 20,
      }),
    );
    expect(result.current).toMatchObject({
      topCount: 30,
      bottomCount: 30,
      hiddenCount: 40,
      indicatorPosition: "middle",
    });
    act(() => result.current.showMore());
    expect(result.current).toMatchObject({
      topCount: 30,
      bottomCount: 50,
      hiddenCount: 20,
      indicatorPosition: "middle",
    });
  });

  it("shows every event under the none method", () => {
    const { result } = renderHook(() =>
      useTimelineExpansion({ count: 100, method: "none" }),
    );
    expect(result.current).toMatchObject({
      topCount: 0,
      bottomCount: 100,
      hiddenCount: 0,
      indicatorPosition: null,
    });
  });

  it("shows nothing at first for a negative count of events to show", () => {
    const { result } = renderHook(() =>
      useTimelineExpansion({ count: 3, initialVisible: -2 }),
    );
    expect(result.current).toMatchObject({
      bottomCount: 0,
      hiddenCount: 3,
      indicatorPosition: "bottom",
    });
  });

  it("keeps one result while nothing it answers changes", () => {
    const { result, rerender } = renderHook(() =>
      useTimelineExpansion({ count: 20 }),
    );
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
