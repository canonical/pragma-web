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
      useActiveItem(renderToolbar("status"), true),
    );
    expect(result.current.activeItem).toBe("entry");
    act(() => result.current.setActiveItem("status"));
    expect(result.current.activeItem).toBe("status");
  });

  it("follows the host's item and tells it of every claim", () => {
    const onActiveItemChange = vi.fn();
    const { result } = renderHook(() =>
      useActiveItem(renderToolbar("status"), true, {
        activeItem: "status",
        onActiveItemChange,
      }),
    );
    expect(onActiveItemChange).not.toHaveBeenCalled();
    act(() => result.current.setActiveItem("entry"));
    expect(onActiveItemChange).toHaveBeenCalledWith("entry");
    expect(result.current.activeItem).toBe("status");
  });

  it("falls back to the entry when its item is gone or disabled", () => {
    const gone = renderHook(() => useActiveItem(renderToolbar("pool"), true));
    act(() => gone.result.current.setActiveItem("status"));
    expect(gone.result.current.activeItem).toBe("entry");
    const onActiveItemChange = vi.fn();
    renderHook(() =>
      useActiveItem(renderToolbar("status", true), true, {
        activeItem: "status",
        onActiveItemChange,
      }),
    );
    expect(onActiveItemChange).toHaveBeenCalledWith("entry");
  });

  it("checks nothing before scripts run, or without a toolbar", () => {
    const onActiveItemChange = vi.fn();
    renderHook(() =>
      useActiveItem(renderToolbar("pool"), false, {
        activeItem: "status",
        onActiveItemChange,
      }),
    );
    expect(onActiveItemChange).not.toHaveBeenCalled();
    renderHook(() =>
      useActiveItem({ current: null }, true, {
        activeItem: "status",
        onActiveItemChange,
      }),
    );
    expect(onActiveItemChange).toHaveBeenCalledWith("entry");
  });
});
