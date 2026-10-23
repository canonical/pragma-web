import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_LENS_FILTER } from "../../../constants.js";
import LensFilterProvider from "../Provider.js";
import useLensFilter from "./useLensFilter.js";

describe("useLensFilter", () => {
  it("degrades to the no-op filter outside a provider, with an inert setter", () => {
    const { result } = renderHook(() => useLensFilter());

    expect(result.current.filter).toBe(DEFAULT_LENS_FILTER);
    act(() => {
      result.current.setFilter({ ...DEFAULT_LENS_FILTER, text: "block" });
      result.current.requestRegion("ds");
    });
    expect(result.current.filter).toBe(DEFAULT_LENS_FILTER);
    expect(result.current.region).toBeUndefined();
  });

  it("reads and writes the provider's filter", () => {
    const { result } = renderHook(() => useLensFilter(), {
      wrapper: LensFilterProvider,
    });

    expect(result.current.filter).toBe(DEFAULT_LENS_FILTER);
    act(() => {
      result.current.setFilter({ ...DEFAULT_LENS_FILTER, text: "block" });
    });
    expect(result.current.filter.text).toBe("block");
  });
});
