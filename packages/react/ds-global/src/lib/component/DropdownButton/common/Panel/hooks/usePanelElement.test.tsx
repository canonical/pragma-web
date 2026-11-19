import { act, renderHook } from "@testing-library/react";
import type { ToggleEvent } from "react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PanelContextValue } from "./types.js";
import usePanelElement from "./usePanelElement.js";

/** A panel state whose setters record their calls. */
const createPanel = (
  overrides: Partial<PanelContextValue> = {},
): PanelContextValue => ({
  panelId: "panel",
  triggerId: "trigger",
  isOpen: false,
  setOpen: vi.fn(),
  kind: "dialog",
  registerMenu: () => () => {},
  focusIntent: "first",
  setFocusIntent: vi.fn(),
  hide: vi.fn(),
  ...overrides,
});

/** A toggle event as React hands it to the listener. */
const createToggle = (
  newState: "open" | "closed",
  currentTarget: HTMLElement,
  target: EventTarget = currentTarget,
) =>
  ({
    newState,
    currentTarget,
    target,
  }) as unknown as ToggleEvent<HTMLDivElement>;

/** A panel element with one control, and its trigger, in the page. */
const createElements = () => {
  document.body.innerHTML =
    '<button id="trigger">Trigger</button><div id="panel" tabindex="-1"><button>Inside</button></div>';
  return {
    trigger: document.getElementById("trigger") as HTMLElement,
    element: document.getElementById("panel") as HTMLDivElement,
  };
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("usePanelElement", () => {
  it("attaches the element to the ref and reads its open state", () => {
    const { element } = createElements();
    const elementRef = createRef<HTMLDivElement>();
    const panel = createPanel();
    const { result } = renderHook(() => usePanelElement({ elementRef, panel }));
    act(() => result.current.attachElement(element));
    expect(elementRef.current).toBe(element);
    expect(panel.setOpen).toHaveBeenCalledWith(false);
  });

  it("records an opening and moves focus to the first control", () => {
    const { element } = createElements();
    const panel = createPanel();
    const onToggle = vi.fn();
    const { result } = renderHook(() =>
      usePanelElement({ elementRef: createRef(), panel, onToggle }),
    );
    act(() => result.current.handleToggle(createToggle("open", element)));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(panel.setOpen).toHaveBeenCalledWith(true);
    expect(document.activeElement?.textContent).toBe("Inside");
  });

  it("returns focus to the trigger after closing with focus inside", () => {
    const { element, trigger } = createElements();
    const panel = createPanel({ isOpen: true });
    const onBeforeToggle = vi.fn();
    const { result } = renderHook(() =>
      usePanelElement({ elementRef: createRef(), panel, onBeforeToggle }),
    );
    (element.querySelector("button") as HTMLElement).focus();
    act(() => {
      result.current.handleBeforeToggle(createToggle("closed", element));
      result.current.handleToggle(createToggle("closed", element));
    });
    expect(onBeforeToggle).toHaveBeenCalledTimes(1);
    expect(panel.setFocusIntent).toHaveBeenCalledWith("first");
    expect(document.activeElement).toBe(trigger);
  });

  it("passes a nested popover's events to the consumer only", () => {
    const { element } = createElements();
    const panel = createPanel();
    const onToggle = vi.fn();
    const onBeforeToggle = vi.fn();
    const { result } = renderHook(() =>
      usePanelElement({
        elementRef: createRef(),
        panel,
        onToggle,
        onBeforeToggle,
      }),
    );
    const nested = document.createElement("div");
    act(() => {
      result.current.handleBeforeToggle(createToggle("open", element, nested));
      result.current.handleToggle(createToggle("open", element, nested));
    });
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onBeforeToggle).toHaveBeenCalledTimes(1);
    expect(panel.setOpen).not.toHaveBeenCalled();
  });

  it("keeps focus where it was for a menu open before hydration", () => {
    document.body.innerHTML =
      '<div id="panel"><a class="ds dropdown-button-menu-item" href="#a">A</a><a class="ds dropdown-button-menu-item" href="#b">B</a></div><button id="out">Out</button>';
    const element = document.getElementById("panel") as HTMLDivElement;
    Object.assign(element, {
      matches: (selector: string) => selector === ":popover-open",
    });
    const panel = createPanel();
    const { result } = renderHook(() =>
      usePanelElement({ elementRef: createRef(), panel }),
    );
    (document.querySelector('[href="#b"]') as HTMLElement).focus();
    act(() => result.current.attachElement(element));
    expect(panel.setFocusIntent).toHaveBeenLastCalledWith(1);
    act(() => result.current.attachElement(null));
    (document.getElementById("out") as HTMLElement).focus();
    act(() => result.current.attachElement(element));
    expect(panel.setFocusIntent).toHaveBeenLastCalledWith("none");
    expect(panel.setOpen).toHaveBeenLastCalledWith(true);
  });
});
