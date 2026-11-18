import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useProviderState from "./useProviderState.js";

describe("useProviderState", () => {
  it("returns the active item and a setter that reports the change", () => {
    const onActiveItemChange = vi.fn();
    const { result } = renderHook(() =>
      useProviderState({ activeItem: "a", onActiveItemChange }),
    );
    expect(result.current.activeItem).toBe("a");
    result.current.setActiveItem("b");
    expect(onActiveItemChange).toHaveBeenCalledWith("b");
  });

  it("records that the stop has moved, and keeps the record", () => {
    const onActiveItemChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ activeItem }) => useProviderState({ activeItem, onActiveItemChange }),
      { initialProps: { activeItem: "a" } },
    );
    expect(result.current.hasMoved).toBe(false);
    rerender({ activeItem: "b" });
    expect(result.current.hasMoved).toBe(true);
    rerender({ activeItem: "a" });
    expect(result.current.hasMoved).toBe(true);
  });

  it("records a claim until the stop moves elsewhere", () => {
    const onActiveItemChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ activeItem }) => useProviderState({ activeItem, onActiveItemChange }),
      { initialProps: { activeItem: "a" } },
    );
    result.current.setActiveItem("b");
    expect(onActiveItemChange).toHaveBeenCalledWith("b");
    rerender({ activeItem: "b" });
    expect(result.current.isClaimed("b")).toBe(true);
    expect(result.current.isClaimed("a")).toBe(false);
    rerender({ activeItem: "c" });
    expect(result.current.isClaimed("b")).toBe(false);
  });

  it("keeps the same value while its inputs do not change", () => {
    const onActiveItemChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ activeItem }) => useProviderState({ activeItem, onActiveItemChange }),
      { initialProps: { activeItem: "a" } },
    );
    const first = result.current;
    rerender({ activeItem: "a" });
    expect(result.current).toBe(first);
    rerender({ activeItem: "b" });
    expect(result.current).not.toBe(first);
    expect(result.current.activeItem).toBe("b");
  });
});
