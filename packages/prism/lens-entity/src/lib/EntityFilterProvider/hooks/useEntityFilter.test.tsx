import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_ENTITY_FILTER } from "../../constants.js";
import EntityFilterProvider from "../Provider.js";
import useEntityFilter from "./useEntityFilter.js";

describe("useEntityFilter", () => {
  it("degrades to the no-op filter outside a provider, with an inert setter", () => {
    const { result } = renderHook(() => useEntityFilter());

    expect(result.current.filter).toBe(DEFAULT_ENTITY_FILTER);
    act(() => {
      result.current.setFilter({ text: "north" });
    });
    expect(result.current.filter).toBe(DEFAULT_ENTITY_FILTER);
  });

  it("reads and writes the provider's filter", () => {
    const { result } = renderHook(() => useEntityFilter(), {
      wrapper: EntityFilterProvider,
    });

    expect(result.current.filter).toBe(DEFAULT_ENTITY_FILTER);
    act(() => {
      result.current.setFilter({ text: "north" });
    });
    expect(result.current.filter).toEqual({ text: "north" });
  });
});
