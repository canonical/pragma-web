import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import createEmptySource from "./createEmptySource.js";
import { machineCollection } from "./fixtures.js";
import useMachineProvider from "./useMachineProvider.js";

describe("useMachineProvider", () => {
  it("builds one provider over the machine collection, kept across renders", () => {
    const hook = renderHook(() => useMachineProvider());
    const first = hook.result.current;
    hook.rerender();
    expect(hook.result.current).toBe(first);
    expect(first.collection).toBe(machineCollection);
  });

  it("starts on the query given, over the source given, prepared once", () => {
    const prepare = vi.fn();
    const source = vi.fn(createEmptySource);
    const hook = renderHook(() =>
      useMachineProvider({ source, query: "status=failed", prepare }),
    );
    hook.rerender();
    expect(source).toHaveBeenCalledTimes(1);
    expect(prepare).toHaveBeenCalledTimes(1);
    expect(prepare).toHaveBeenCalledWith(hook.result.current);
    expect(
      readProviderHost(hook.result.current).state.get().slice.filter,
    ).toEqual([{ field: "status", operator: "isAny", operands: ["failed"] }]);
  });
});
