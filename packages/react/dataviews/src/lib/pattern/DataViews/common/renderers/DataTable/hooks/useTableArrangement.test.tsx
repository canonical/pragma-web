/**
 * Where a table keeps its arrangement: under its id in the provider's
 * presentation, or in a presentation of its own for the mount.
 */
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createMachineProvider,
  silenceRenderErrors,
} from "../../../../../../../../testing/index.js";
import useTableArrangement from "./useTableArrangement.js";

describe("useTableArrangement", () => {
  it("keeps a table with an id in the provider's presentation, under its id", () => {
    const { provider } = createMachineProvider();
    const { result } = renderHook(() =>
      useTableArrangement(provider, true, { id: "machines.list" }),
    );
    expect(result.current).toEqual({
      table: "machines.list",
      presentation: provider.presentation,
      shared: true,
    });
  });

  it("names a table by a whitespace id", () => {
    const { provider } = createMachineProvider();
    const { result } = renderHook(() =>
      useTableArrangement(provider, true, { id: " " }),
    );
    expect(result.current).toEqual({
      table: " ",
      presentation: provider.presentation,
      shared: true,
    });
  });

  it("keeps a table without an id in one presentation of its own for the mount", () => {
    const { provider } = createMachineProvider();
    const { result, rerender } = renderHook(() =>
      useTableArrangement(provider, false, { id: "" }),
    );
    const first = result.current.presentation;
    expect(first).not.toBe(provider.presentation);
    expect(result.current.shared).toBe(false);
    rerender();
    expect(result.current.presentation).toBe(first);
  });

  it("throws for settings without an id", () => {
    silenceRenderErrors();
    const { provider } = createMachineProvider();
    expect(() => renderHook(() => useTableArrangement(provider, true))).toThrow(
      "DataTable takes an id with settings",
    );
    expect(() =>
      renderHook(() => useTableArrangement(provider, true, { id: "" })),
    ).toThrow("DataTable takes an id with settings");
  });

  it("throws for an id holding a lone surrogate, which no key can spell", () => {
    silenceRenderErrors();
    const { provider } = createMachineProvider();
    expect(() =>
      renderHook(() => useTableArrangement(provider, false, { id: "a\uD800" })),
    ).toThrow("DataTable takes a well-formed id");
    const { result } = renderHook(() =>
      useTableArrangement(provider, false, { id: "a\uD83D\uDE00" }),
    );
    expect(result.current.table).toBe("a\uD83D\uDE00");
  });
});
