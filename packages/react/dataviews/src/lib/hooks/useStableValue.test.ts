import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useStableValue from "./useStableValue.js";

/** Whether two lists hold the same entries in the same order. */
const areListsEqual = (
  held: readonly number[],
  next: readonly number[],
): boolean =>
  held.length === next.length &&
  held.every((entry, index) => entry === next.at(index));

describe("useStableValue", () => {
  it("returns the held reference while the new value equals it", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useStableValue(value, areListsEqual),
      { initialProps: { value: [1, 2] } },
    );
    const first = result.current;
    rerender({ value: [1, 2] });
    expect(result.current).toBe(first);
  });

  it("takes a value that differs", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useStableValue(value, areListsEqual),
      { initialProps: { value: [1, 2] } },
    );
    const next = [1, 3];
    rerender({ value: next });
    expect(result.current).toBe(next);
  });

  it("asks nothing of the same reference", () => {
    const value = [1];
    let asked = 0;
    const { result, rerender } = renderHook(() =>
      useStableValue(value, () => {
        asked += 1;
        return false;
      }),
    );
    rerender();
    expect(result.current).toBe(value);
    expect(asked).toBe(0);
  });
});
