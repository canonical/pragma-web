import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UseDisclosureProps } from "./index.js";
import { useDisclosure } from "./index.js";

/** Runs the hook in an effect root over a real trigger and popup. */
const setup = (initial: UseDisclosureProps = {}) => {
  const trigger = document.createElement("button");
  const popup = document.createElement("div");
  const inside = document.createElement("span");
  popup.append(inside);
  document.body.append(trigger, popup);
  const state = $state({ props: initial });
  let disclosure!: ReturnType<typeof useDisclosure>;
  const destroy = $effect.root(() => {
    disclosure = useDisclosure(() => state.props, "popup-id", {
      target: trigger,
      popup,
    });
  });
  flushSync();
  return { state, disclosure, destroy, trigger, popup, inside };
};

const pointer = (type: string, target: EventTarget = document.body) => {
  const event = new PointerEvent(type);
  Object.defineProperty(event, "target", { value: target });
  return event;
};

describe("useDisclosure", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it("returns the initial state, controls, and prop-getters", () => {
    const { disclosure, destroy } = setup();
    expect(disclosure.isOpen).toBe(false);
    expect(disclosure.isFocused).toBe(false);
    expect(disclosure.popupId).toBe("popup-id");
    expect(disclosure.direction).toBe("ltr");
    expect(disclosure.bestPosition).toMatchObject({ positionName: "top" });
    expect(disclosure.arrowOffset).toBeDefined();
    expect(disclosure.popupPositionStyle).toContain("max-width: 350px");
    expect(disclosure.open).toBeInstanceOf(Function);
    expect(disclosure.close).toBeInstanceOf(Function);
    expect(disclosure.toggle).toBeInstanceOf(Function);
    destroy();
  });

  it("honours the isOpen override", () => {
    const { disclosure, destroy } = setup({ isOpen: true });
    expect(disclosure.isOpen).toBe(true);
    destroy();
  });

  it("marks the content hidden while closed and visible while open", () => {
    const { state, disclosure, destroy } = setup({ isOpen: false });
    expect(disclosure.getContentProps()).toMatchObject({
      id: "popup-id",
      hidden: true,
    });
    state.props = { isOpen: true };
    flushSync();
    expect(disclosure.getContentProps().hidden).toBe(false);
    destroy();
  });

  describe("hover mode (default)", () => {
    it("exposes pointer and describedby wiring on the trigger", () => {
      const { disclosure, destroy } = setup({ mode: "hover" });
      const toggleProps = disclosure.getToggleProps();
      expect(toggleProps["aria-describedby"]).toBe("popup-id");
      expect(toggleProps["aria-expanded"]).toBeUndefined();
      expect(toggleProps.onpointerenter).toBeInstanceOf(Function);
      expect(toggleProps.onpointerleave).toBeInstanceOf(Function);
      const contentProps = disclosure.getContentProps();
      expect(contentProps.onpointerenter).toBeInstanceOf(Function);
      expect(contentProps.onpointerleave).toBeInstanceOf(Function);
      destroy();
    });

    it("opens on pointer-enter and closes on pointer-leave, after the delays", () => {
      const onenter = vi.fn();
      const onleave = vi.fn();
      const onshow = vi.fn();
      const onhide = vi.fn();
      const { disclosure, destroy } = setup({
        activateDelay: 50,
        deactivateDelay: 80,
        onenter,
        onleave,
        onshow,
        onhide,
      });
      const enter = pointer("pointerenter");
      disclosure.getToggleProps().onpointerenter?.(enter);
      expect(onenter).toHaveBeenCalledExactlyOnceWith(enter);
      vi.advanceTimersByTime(49);
      expect(disclosure.isOpen).toBe(false);
      vi.advanceTimersByTime(1);
      expect(disclosure.isOpen).toBe(true);
      expect(onshow).toHaveBeenCalledOnce();

      disclosure.getToggleProps().onpointerleave?.(pointer("pointerleave"));
      expect(onleave).toHaveBeenCalledOnce();
      vi.advanceTimersByTime(80);
      expect(disclosure.isOpen).toBe(false);
      expect(onhide).toHaveBeenCalledOnce();
      destroy();
    });

    it("opens on focus and closes on blur (keyboard parity)", () => {
      const onfocus = vi.fn();
      const onblur = vi.fn();
      const { disclosure, destroy } = setup({ onfocus, onblur });
      disclosure.getToggleProps().onfocus?.(new FocusEvent("focus"));
      expect(disclosure.isFocused).toBe(true);
      expect(onfocus).toHaveBeenCalledOnce();
      vi.advanceTimersByTime(150);
      expect(disclosure.isOpen).toBe(true);

      disclosure.getToggleProps().onblur?.(new FocusEvent("blur"));
      expect(disclosure.isFocused).toBe(false);
      expect(onblur).toHaveBeenCalledOnce();
      vi.advanceTimersByTime(150);
      expect(disclosure.isOpen).toBe(false);
      destroy();
    });

    it("does not open or close if the trigger is disabled", () => {
      const onenter = vi.fn();
      const onleave = vi.fn();
      const { disclosure, destroy } = setup({ onenter, onleave });
      const disabled = { disabled: true } as unknown as EventTarget;
      disclosure
        .getToggleProps()
        .onpointerenter?.(pointer("pointerenter", disabled));
      disclosure
        .getToggleProps()
        .onpointerleave?.(pointer("pointerleave", disabled));
      vi.advanceTimersByTime(150);
      expect(disclosure.isOpen).toBe(false);
      expect(onenter).not.toHaveBeenCalled();
      expect(onleave).not.toHaveBeenCalled();
      destroy();
    });

    it("toggles with the imperative controls", () => {
      const { disclosure, destroy } = setup();
      disclosure.toggle();
      vi.advanceTimersByTime(150);
      expect(disclosure.isOpen).toBe(true);
      disclosure.toggle();
      vi.advanceTimersByTime(150);
      expect(disclosure.isOpen).toBe(false);
      destroy();
    });

    it("closes on Escape while open", () => {
      const { disclosure, destroy } = setup();
      disclosure.open();
      vi.advanceTimersByTime(150);
      flushSync();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
      vi.advanceTimersByTime(150);
      expect(disclosure.isOpen).toBe(true);
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      vi.advanceTimersByTime(150);
      expect(disclosure.isOpen).toBe(false);
      destroy();
    });

    it("ignores Escape when closeOnEscape is false", () => {
      const { disclosure, destroy } = setup({ closeOnEscape: false });
      disclosure.open();
      vi.advanceTimersByTime(150);
      flushSync();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      vi.advanceTimersByTime(150);
      expect(disclosure.isOpen).toBe(true);
      destroy();
    });

    it("ignores keyboard activation", () => {
      const { disclosure, destroy } = setup();
      const keydown = disclosure.getToggleProps().onkeydown;
      expect(keydown).toBeUndefined();
      destroy();
    });
  });

  describe("click mode", () => {
    it("exposes expanded/controls wiring on the trigger", () => {
      const { disclosure, destroy } = setup({ mode: "click" });
      const toggleProps = disclosure.getToggleProps();
      expect(toggleProps["aria-expanded"]).toBe(false);
      expect(toggleProps["aria-controls"]).toBe("popup-id");
      expect(toggleProps["aria-describedby"]).toBeUndefined();
      expect(toggleProps.onclick).toBeInstanceOf(Function);
      expect(toggleProps.onkeydown).toBeInstanceOf(Function);
      expect(disclosure.getContentProps().onpointerenter).toBeUndefined();
      destroy();
    });

    it("does not open on focus alone", () => {
      const { disclosure, destroy } = setup({ mode: "click" });
      disclosure.getToggleProps().onfocus?.(new FocusEvent("focus"));
      expect(disclosure.isFocused).toBe(true);
      expect(disclosure.isOpen).toBe(false);
      disclosure.getToggleProps().onblur?.(new FocusEvent("blur"));
      expect(disclosure.isFocused).toBe(false);
      destroy();
    });

    it("toggles open and shut on click, synchronously, returning focus", () => {
      const onshow = vi.fn();
      const onhide = vi.fn();
      const { disclosure, destroy, trigger } = setup({
        mode: "click",
        onshow,
        onhide,
      });
      disclosure.getToggleProps().onclick?.(pointer("click", trigger));
      expect(disclosure.isOpen).toBe(true);
      expect(onshow).toHaveBeenCalledOnce();
      disclosure.getToggleProps().onclick?.(pointer("click", trigger));
      expect(disclosure.isOpen).toBe(false);
      expect(onhide).toHaveBeenCalledOnce();
      expect(document.activeElement).toBe(trigger);
      destroy();
    });

    it("does not return focus when returnFocus is false", () => {
      const { disclosure, destroy, trigger } = setup({
        mode: "click",
        returnFocus: false,
      });
      disclosure.open();
      disclosure.close();
      expect(disclosure.isOpen).toBe(false);
      expect(document.activeElement).not.toBe(trigger);
      destroy();
    });

    it("ignores clicks on a disabled trigger", () => {
      const { disclosure, destroy } = setup({ mode: "click" });
      const disabled = { disabled: true } as unknown as EventTarget;
      disclosure.getToggleProps().onclick?.(pointer("click", disabled));
      expect(disclosure.isOpen).toBe(false);
      destroy();
    });

    it("toggles on Space and Enter, and opens on ArrowDown when closed", () => {
      const { disclosure, destroy } = setup({ mode: "click" });
      const key = (value: string) => {
        const event = new KeyboardEvent("keydown", {
          key: value,
          cancelable: true,
        });
        disclosure.getToggleProps().onkeydown?.(event);
        return event;
      };
      expect(key("ArrowDown").defaultPrevented).toBe(true);
      expect(disclosure.isOpen).toBe(true);
      expect(key("ArrowDown").defaultPrevented).toBe(false);
      expect(key("Enter").defaultPrevented).toBe(true);
      expect(disclosure.isOpen).toBe(false);
      expect(key(" ").defaultPrevented).toBe(true);
      expect(disclosure.isOpen).toBe(true);
      expect(key("a").defaultPrevented).toBe(false);
      expect(disclosure.isOpen).toBe(true);
      destroy();
    });

    it("closes on outside pointer-down, not inside the trigger or popup", () => {
      const { disclosure, destroy, trigger, inside } = setup({ mode: "click" });
      disclosure.open();
      flushSync();
      inside.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      trigger.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      expect(disclosure.isOpen).toBe(true);
      document.body.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true }),
      );
      expect(disclosure.isOpen).toBe(false);
      destroy();
    });

    it("stays open on outside pointer-down when closeOnOutsideClick is false", () => {
      const { disclosure, destroy } = setup({
        mode: "click",
        closeOnOutsideClick: false,
      });
      disclosure.open();
      flushSync();
      document.body.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true }),
      );
      expect(disclosure.isOpen).toBe(true);
      destroy();
    });

    it("closes a controlled-open click disclosure on Escape", () => {
      const onhide = vi.fn();
      const { destroy } = setup({ mode: "click", isOpen: true, onhide });
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(onhide).toHaveBeenCalledOnce();
      destroy();
    });
  });
});
