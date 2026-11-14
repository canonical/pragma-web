import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useStableCallback from "./useStableCallback.js";

describe("useStableCallback", () => {
  it("holds one identity across renders", () => {
    const { result, rerender } = renderHook(
      ({ callback }) => useStableCallback(callback),
      { initialProps: { callback: (value: number) => value + 1 } },
    );
    const first = result.current;
    rerender({ callback: (value: number) => value + 2 });
    expect(result.current).toBe(first);
  });

  it("calls the latest function with its arguments", () => {
    const { result, rerender } = renderHook(
      ({ callback }) => useStableCallback(callback),
      { initialProps: { callback: (value: number) => value + 1 } },
    );
    expect(result.current(1)).toBe(2);
    rerender({ callback: (value: number) => value * 10 });
    expect(result.current(1)).toBe(10);
  });
});
