import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import usePanelState from "./usePanelState.js";

describe("usePanelState", () => {
  it("starts closed, with the ids and anchor it is given", () => {
    const { result } = renderHook(() =>
      usePanelState({ panelId: "p", triggerId: "t", anchorName: "--p" }),
    );
    expect(result.current).toMatchObject({
      panelId: "p",
      triggerId: "t",
      anchorName: "--p",
      isOpen: false,
    });
  });

  it("records the open state", () => {
    const { result } = renderHook(() => usePanelState({ panelId: "p" }));
    act(() => result.current.setOpen(true));
    expect(result.current.isOpen).toBe(true);
  });

  it("keeps its identity until the state changes", () => {
    const { result, rerender } = renderHook(() =>
      usePanelState({ panelId: "p" }),
    );
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
    act(() => result.current.setOpen(true));
    expect(result.current).not.toBe(first);
  });
});
