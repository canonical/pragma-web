import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMachineProvider } from "../../../../../testing/index.js";
import DataViews from "../Provider.js";
import useDataViewsRoot from "./useDataViewsRoot.js";

describe("useDataViewsRoot", () => {
  it("reads the enclosing root's provider", () => {
    const { provider } = createMachineProvider();
    const { result } = renderHook(() => useDataViewsRoot("Part"), {
      wrapper: ({ children }) => (
        <DataViews provider={provider}>{children}</DataViews>
      ),
    });
    expect(result.current.provider).toBe(provider);
  });

  it("throws outside a root, naming the part", () => {
    expect(() => renderHook(() => useDataViewsRoot("Search"))).toThrow(
      "DataViews.Search must be used inside a DataViews root",
    );
  });
});
