import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import usePanelState from "./usePanelState.js";

/** Closes nothing: these tests read the state, not the element. */
const hide = () => {};

describe("usePanelState", () => {
  it("starts closed, with the ids and anchor it is given", () => {
    const { result } = renderHook(() =>
      usePanelState({
        panelId: "p",
        triggerId: "t",
        anchorName: "--p",
        hide,
      }),
    );
    expect(result.current).toMatchObject({
      panelId: "p",
      triggerId: "t",
      anchorName: "--p",
      isOpen: false,
    });
  });

  it("records the open state", () => {
    const { result } = renderHook(() => usePanelState({ panelId: "p", hide }));
    act(() => result.current.setOpen(true));
    expect(result.current.isOpen).toBe(true);
  });

  it("keeps its identity until the state changes", () => {
    const { result, rerender } = renderHook(() =>
      usePanelState({ panelId: "p", hide }),
    );
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
    act(() => result.current.setOpen(true));
    expect(result.current).not.toBe(first);
  });

  it("is a dialog until a menu registers, and again once it leaves", () => {
    const { result } = renderHook(() => usePanelState({ panelId: "p", hide }));
    expect(result.current.kind).toBe("dialog");
    let unregister = () => {};
    act(() => {
      unregister = result.current.registerMenu();
    });
    expect(result.current.kind).toBe("menu");
    act(() => unregister());
    expect(result.current.kind).toBe("dialog");
  });

  it("records which item a menu focuses on opening", () => {
    const { result } = renderHook(() => usePanelState({ panelId: "p", hide }));
    expect(result.current.focusIntent).toBe("first");
    act(() => result.current.setFocusIntent("last"));
    expect(result.current.focusIntent).toBe("last");
  });

  it("passes on the way to close the panel", () => {
    const close = vi.fn();
    const { result } = renderHook(() =>
      usePanelState({ panelId: "p", hide: close }),
    );
    result.current.hide();
    expect(close).toHaveBeenCalledTimes(1);
  });
});
