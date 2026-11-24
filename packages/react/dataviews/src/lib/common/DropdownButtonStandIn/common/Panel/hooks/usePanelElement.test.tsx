import { assertInvariant } from "@canonical/dataviews-core/bindings";
import { act, renderHook } from "@testing-library/react";
import type { ToggleEvent } from "react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PanelState } from "./types.js";
import usePanelElement from "./usePanelElement.js";

/** A panel state whose setters record their calls. */
const createPanel = (overrides: Partial<PanelState> = {}): PanelState => ({
  panelId: "panel",
  triggerId: "trigger",
  anchorName: "--panel",
  elementRef: createRef(),
  isOpen: false,
  setOpen: vi.fn(),
  focusIntent: "first",
  setFocusIntent: vi.fn(),
  show: vi.fn(),
  hide: vi.fn(),
  ...overrides,
});

/** A toggle event as React hands it to the listener. */
const createToggle = (
  newState: "open" | "closed",
  currentTarget: HTMLElement,
) => ({ newState, currentTarget }) as unknown as ToggleEvent<HTMLDivElement>;

/** A popover element with one item, and its trigger, in the page. */
const createElements = () => {
  document.body.innerHTML =
    '<button id="trigger">Trigger</button><div id="panel" tabindex="-1"><a class="ds dropdown-button-menu-item" href="#a">Inside</a></div>';
  return {
    trigger: assertInvariant(
      document.getElementById("trigger"),
      "the element renders",
    ),
    element: assertInvariant(
      document.getElementById("panel"),
      "the element renders",
    ) as HTMLDivElement,
  };
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("usePanelElement", () => {
  it("attaches the element to the ref and reads its open state", () => {
    const { element } = createElements();
    const panel = createPanel();
    const { result } = renderHook(() => usePanelElement(panel));
    act(() => result.current.attachElement(element));
    expect(panel.elementRef.current).toBe(element);
    expect(panel.setOpen).toHaveBeenCalledWith(false);
    expect(panel.setFocusIntent).not.toHaveBeenCalled();
  });

  it("records an opening and leaves focus to the menu", () => {
    const { element, trigger } = createElements();
    const panel = createPanel();
    const { result } = renderHook(() => usePanelElement(panel));
    act(() => trigger.focus());
    act(() => result.current.handleBeforeToggle(createToggle("open", element)));
    act(() => result.current.handleToggle(createToggle("open", element)));
    expect(panel.setOpen).toHaveBeenCalledWith(true);
    expect(document.activeElement).toBe(trigger);
  });

  it("returns focus to the trigger after closing with focus inside", () => {
    const { element, trigger } = createElements();
    const panel = createPanel({ isOpen: true });
    const { result } = renderHook(() => usePanelElement(panel));
    assertInvariant(element.querySelector("a"), "the element renders").focus();
    act(() => {
      result.current.handleBeforeToggle(createToggle("closed", element));
      result.current.handleToggle(createToggle("closed", element));
    });
    expect(panel.setFocusIntent).toHaveBeenCalledWith("first");
    expect(document.activeElement).toBe(trigger);
  });

  it("keeps focus where it was for a menu open before hydration", () => {
    document.body.innerHTML =
      '<div id="panel"><a class="ds dropdown-button-menu-item" href="#a">A</a><a class="ds dropdown-button-menu-item" href="#b">B</a></div><button id="out">Out</button>';
    const element = assertInvariant(
      document.getElementById("panel"),
      "the element renders",
    ) as HTMLDivElement;
    Object.assign(element, {
      matches: (selector: string) => selector === ":popover-open",
    });
    const panel = createPanel();
    const { result } = renderHook(() => usePanelElement(panel));
    (
      assertInvariant(
        document.querySelector('[href="#b"]'),
        "the element renders",
      ) as HTMLElement
    ).focus();
    act(() => result.current.attachElement(element));
    expect(panel.setFocusIntent).toHaveBeenLastCalledWith(1);
    act(() => result.current.attachElement(null));
    assertInvariant(
      document.getElementById("out"),
      "the element renders",
    ).focus();
    act(() => result.current.attachElement(element));
    expect(panel.setFocusIntent).toHaveBeenLastCalledWith("none");
    expect(panel.setOpen).toHaveBeenLastCalledWith(true);
  });
});
