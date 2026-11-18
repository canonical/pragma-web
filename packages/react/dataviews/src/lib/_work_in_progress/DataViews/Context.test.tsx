import { renderHook } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";
import createMachineProvider from "../../../../testing/createMachineProvider.js";
import Context from "./Context.js";
import DataViews from "./Provider.js";

describe("Context", () => {
  it("holds null outside a root", () => {
    const { result } = renderHook(() => useContext(Context));
    expect(result.current).toBeNull();
  });

  it("carries the root's provider inside one", () => {
    const { provider } = createMachineProvider();
    const { result } = renderHook(() => useContext(Context), {
      wrapper: ({ children }) => (
        <DataViews provider={provider}>{children}</DataViews>
      ),
    });
    expect(result.current?.provider).toBe(provider);
  });
});
