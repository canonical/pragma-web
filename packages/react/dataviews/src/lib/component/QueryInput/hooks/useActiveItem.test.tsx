import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useActiveItem from "./useActiveItem.js";

/** A toolbar holding one roving item. */
const renderToolbar = (itemId: string, disabled = false) => {
  const content = document.createElement("div");
  content.innerHTML = `<button data-roving-item="${itemId}"${disabled ? " disabled" : ""}></button>`;
  return { current: content };
};

describe("useActiveItem", () => {
  it("keeps its own item, starting on the entry", () => {
    const { result } = renderHook(() =>
      useActiveItem({ contentRef: renderToolbar("status"), isMounted: true }),
    );
    expect(result.current.activeItem).toBe("entry");
    act(() => result.current.setActiveItem("status"));
    expect(result.current.activeItem).toBe("status");
  });

  it("follows the host's item and tells it of every claim", () => {
    const onActiveItemChange = vi.fn();
    const { result } = renderHook(() =>
      useActiveItem({
        activeItem: "status",
        onActiveItemChange,
        contentRef: renderToolbar("status"),
        isMounted: true,
      }),
    );
    expect(onActiveItemChange).not.toHaveBeenCalled();
    act(() => result.current.setActiveItem("entry"));
    expect(onActiveItemChange).toHaveBeenCalledWith("entry");
    expect(result.current.activeItem).toBe("status");
  });

  it("falls back to the entry when its item is gone or disabled", () => {
    const gone = renderHook(() =>
      useActiveItem({ contentRef: renderToolbar("pool"), isMounted: true }),
    );
    act(() => gone.result.current.setActiveItem("status"));
    expect(gone.result.current.activeItem).toBe("entry");
    const onActiveItemChange = vi.fn();
    renderHook(() =>
      useActiveItem({
        activeItem: "status",
        onActiveItemChange,
        contentRef: renderToolbar("status", true),
        isMounted: true,
      }),
    );
    expect(onActiveItemChange).toHaveBeenCalledWith("entry");
  });

  it("checks nothing before scripts run, or without a toolbar", () => {
    const onActiveItemChange = vi.fn();
    renderHook(() =>
      useActiveItem({
        activeItem: "status",
        onActiveItemChange,
        contentRef: renderToolbar("pool"),
        isMounted: false,
      }),
    );
    expect(onActiveItemChange).not.toHaveBeenCalled();
    renderHook(() =>
      useActiveItem({
        activeItem: "status",
        onActiveItemChange,
        contentRef: { current: null },
        isMounted: true,
      }),
    );
    expect(onActiveItemChange).toHaveBeenCalledWith("entry");
  });
});
