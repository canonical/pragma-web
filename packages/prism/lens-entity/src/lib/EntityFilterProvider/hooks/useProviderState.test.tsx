import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_ENTITY_FILTER } from "../../constants.js";
import useProviderState from "./useProviderState.js";

describe("useProviderState", () => {
  it("starts from the no-op default, so both sides of hydration agree", () => {
    const { result } = renderHook(() => useProviderState());
    expect(result.current.filter).toBe(DEFAULT_ENTITY_FILTER);
  });

  it("keeps its value's identity until the filter changes", () => {
    const { result, rerender } = renderHook(() => useProviderState());
    const first = result.current;

    rerender();
    expect(result.current).toBe(first);

    act(() => {
      first.setFilter({ ...DEFAULT_ENTITY_FILTER, view: "cards" });
    });
    expect(result.current).not.toBe(first);
    expect(result.current.filter.view).toBe("cards");
  });
});
