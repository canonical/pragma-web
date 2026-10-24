import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_JOURNEY_VIEW } from "../../../constants.js";
import useProviderState from "./useProviderState.js";

describe("useProviderState", () => {
  it("starts from the table, so both sides of hydration agree", () => {
    const { result } = renderHook(() => useProviderState());
    expect(result.current.view).toBe(DEFAULT_JOURNEY_VIEW);
  });

  it("keeps its value's identity until the view changes", () => {
    const { result, rerender } = renderHook(() => useProviderState());
    const first = result.current;

    rerender();
    expect(result.current).toBe(first);

    act(() => {
      first.setView("graph");
    });
    expect(result.current).not.toBe(first);
    expect(result.current.view).toBe("graph");
  });
});
