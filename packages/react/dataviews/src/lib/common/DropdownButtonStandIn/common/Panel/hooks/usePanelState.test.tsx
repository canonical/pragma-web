import { act, renderHook } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { installPopoverStandIn } from "../../../../../../../testing/index.js";
import usePanelState from "./usePanelState.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const ids = { panelId: "p", triggerId: "t", anchorName: "--p" };

describe("usePanelState", () => {
  it("starts closed, with the ids and anchor it is given", () => {
    const { result } = renderHook(() => usePanelState(ids));
    expect(result.current).toMatchObject({ ...ids, isOpen: false });
    expect(result.current.elementRef.current).toBeNull();
  });

  it("records the open state", () => {
    const { result } = renderHook(() => usePanelState(ids));
    act(() => result.current.setOpen(true));
    expect(result.current.isOpen).toBe(true);
  });

  it("keeps its identity until the state changes", () => {
    const { result, rerender } = renderHook(() => usePanelState(ids));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
    act(() => result.current.setOpen(true));
    expect(result.current).not.toBe(first);
  });

  it("records which item the menu focuses on opening", () => {
    const { result } = renderHook(() => usePanelState(ids));
    expect(result.current.focusIntent).toBe("first");
    act(() => result.current.setFocusIntent("last"));
    expect(result.current.focusIntent).toBe("last");
  });

  it("shows and hides the popover element, each only once", () => {
    const { result } = renderHook(() => usePanelState(ids));
    const popover = document.createElement("div");
    popover.setAttribute("popover", "auto");
    document.body.append(popover);
    result.current.elementRef.current = popover;
    const states: string[] = [];
    popover.addEventListener("beforetoggle", (event) =>
      states.push((event as ToggleEvent).newState),
    );
    result.current.hide();
    result.current.show();
    result.current.show();
    expect(popover.matches(":popover-open")).toBe(true);
    result.current.hide();
    result.current.hide();
    expect(states).toEqual(["open", "closed"]);
    popover.remove();
  });

  it("does nothing before the element mounts", () => {
    const { result } = renderHook(() => usePanelState(ids));
    expect(() => {
      result.current.show();
      result.current.hide();
    }).not.toThrow();
  });
});
