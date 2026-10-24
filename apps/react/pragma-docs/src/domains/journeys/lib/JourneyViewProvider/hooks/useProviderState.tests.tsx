import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_JOURNEY_VIEW } from "../../../constants.js";
import { ALL_JOURNEYS_FILTER } from "../../../journeyFilter.js";
import useProviderState from "./useProviderState.js";

describe("useProviderState", () => {
  it("starts from the table, so both sides of hydration agree", () => {
    const { result } = renderHook(() => useProviderState());
    expect(result.current.view).toBe(DEFAULT_JOURNEY_VIEW);
  });

  it("starts from no filter and records the reader's choice", () => {
    const { result } = renderHook(() => useProviderState());
    expect(result.current.filter).toBeUndefined();
    const choice = { job: undefined, filter: ALL_JOURNEYS_FILTER };
    act(() => {
      result.current.setFilter(choice);
    });
    expect(result.current.filter).toBe(choice);
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
