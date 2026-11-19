import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import installPopoverStandIn from "./installPopoverStandIn.js";

/** Lets the queued `toggle` events run. */
const flushToggles = () => Promise.resolve();

/** Builds a popover and a button that targets it, and adds both to the page. */
const createPair = (popover = "auto", action?: string) => {
  const panel = document.createElement("div");
  panel.id = `panel-${Math.random().toString(36).slice(2)}`;
  panel.setAttribute("popover", popover);
  panel.innerHTML = "<button type='button'>Inside</button>";
  const invoker = document.createElement("button");
  invoker.setAttribute("popovertarget", panel.id);
  if (action) invoker.setAttribute("popovertargetaction", action);
  document.body.append(invoker, panel);
  return { panel, invoker, inside: panel.querySelector("button") };
};

describe("installPopoverStandIn", () => {
  let uninstall: () => void;

  beforeEach(() => {
    uninstall = installPopoverStandIn();
  });

  afterEach(() => {
    uninstall();
    document.body.innerHTML = "";
  });

  describe("the element methods", () => {
    it("opens and closes with showPopover and hidePopover", () => {
      const { panel } = createPair();
      expect(panel.matches(":popover-open")).toBe(false);
      panel.showPopover();
      expect(panel.matches(":popover-open")).toBe(true);
      panel.hidePopover();
      expect(panel.matches(":popover-open")).toBe(false);
    });

    it("shows an open popover, so its controls take focus, and restores its inline display", () => {
      const { panel, inside } = createPair();
      panel.style.display = "grid";
      panel.showPopover();
      expect(panel.style.display).toBe("block");
      inside?.focus();
      expect(inside).toHaveFocus();
      panel.hidePopover();
      expect(panel.style.display).toBe("grid");
    });

    it("does nothing when asked for the state it is already in", () => {
      const { panel } = createPair();
      const listener = vi.fn();
      panel.addEventListener("beforetoggle", listener);
      panel.hidePopover();
      panel.showPopover();
      panel.showPopover();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("toggles, or forces a state, and returns the new state", () => {
      const { panel } = createPair();
      expect(panel.togglePopover()).toBe(true);
      expect(panel.togglePopover()).toBe(false);
      expect(panel.togglePopover(true)).toBe(true);
      expect(panel.togglePopover(true)).toBe(true);
      expect(panel.togglePopover(false)).toBe(false);
    });

    it("refuses an element with no popover attribute", () => {
      const plain = document.createElement("div");
      expect(() => plain.showPopover()).toThrow("Not a popover");
      expect(() => plain.hidePopover()).toThrow("Not a popover");
      expect(() => plain.togglePopover()).toThrow("Not a popover");
    });

    it("leaves every other selector to jsdom", () => {
      const { panel } = createPair();
      expect(panel.matches("div[popover]")).toBe(true);
    });
  });

  describe("the toggle events", () => {
    it("dispatches beforetoggle at once and toggle after", async () => {
      const { panel } = createPair();
      const states: string[] = [];
      panel.addEventListener("beforetoggle", (event) => {
        const { oldState, newState } = event as ToggleEvent;
        states.push(`before ${oldState}>${newState}`);
      });
      panel.addEventListener("toggle", (event) => {
        const { oldState, newState } = event as ToggleEvent;
        states.push(`toggle ${oldState}>${newState}`);
      });
      panel.showPopover();
      expect(states).toEqual(["before closed>open"]);
      await flushToggles();
      panel.hidePopover();
      await flushToggles();
      expect(states).toEqual([
        "before closed>open",
        "toggle closed>open",
        "before open>closed",
        "toggle open>closed",
      ]);
    });

    it("defines ToggleEvent, defaulting to a closed-to-open change", () => {
      const event = new ToggleEvent("toggle");
      expect(event.oldState).toBe("closed");
      expect(event.newState).toBe("open");
    });
  });

  describe("the invoker", () => {
    it("toggles its target on click", () => {
      const { panel, invoker } = createPair();
      invoker.click();
      expect(panel.matches(":popover-open")).toBe(true);
      invoker.click();
      expect(panel.matches(":popover-open")).toBe(false);
    });

    it("runs a show or hide action", () => {
      const shown = createPair("auto", "show");
      shown.invoker.click();
      shown.invoker.click();
      expect(shown.panel.matches(":popover-open")).toBe(true);
      const hidden = createPair("manual", "hide");
      hidden.panel.showPopover();
      hidden.invoker.click();
      expect(hidden.panel.matches(":popover-open")).toBe(false);
    });

    it("does nothing when the click is cancelled or the button disabled", () => {
      const { panel, invoker } = createPair();
      const cancel = (event: Event) => event.preventDefault();
      invoker.addEventListener("click", cancel);
      invoker.click();
      expect(panel.matches(":popover-open")).toBe(false);
      invoker.removeEventListener("click", cancel);
      invoker.disabled = true;
      invoker.click();
      expect(panel.matches(":popover-open")).toBe(false);
    });

    it("ignores clicks that name no popover", () => {
      const { panel } = createPair();
      const stray = document.createElement("button");
      stray.setAttribute("popovertarget", "missing");
      const plainTarget = document.createElement("button");
      plainTarget.setAttribute("popovertarget", "plain");
      const plain = document.createElement("div");
      plain.id = "plain";
      document.body.append(stray, plainTarget, plain);
      stray.click();
      plainTarget.click();
      panel.click();
      document.dispatchEvent(new MouseEvent("click"));
      expect(plain.matches(":popover-open")).toBe(false);
      expect(panel.matches(":popover-open")).toBe(false);
    });

    it("treats a button with no target as naming none", () => {
      const unnamed = document.createElement("button");
      unnamed.setAttribute("popovertarget", "");
      document.body.append(unnamed);
      expect(() => unnamed.click()).not.toThrow();
    });
  });

  describe("dismissal", () => {
    it("hides the topmost auto popover on Escape", () => {
      const { panel } = createPair();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      panel.showPopover();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(panel.matches(":popover-open")).toBe(true);
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(panel.matches(":popover-open")).toBe(false);
    });

    it("hides an auto popover on a pointer released outside it and its invoker", () => {
      const { panel, invoker, inside } = createPair();
      invoker.click();
      inside?.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
      invoker.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
      expect(panel.matches(":popover-open")).toBe(true);
      document.body.dispatchEvent(
        new PointerEvent("pointerup", { bubbles: true }),
      );
      expect(panel.matches(":popover-open")).toBe(false);
    });

    it("never light-dismisses a manual popover", () => {
      const { panel } = createPair("manual");
      panel.showPopover();
      document.body.dispatchEvent(
        new PointerEvent("pointerup", { bubbles: true }),
      );
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(panel.matches(":popover-open")).toBe(true);
    });

    it("keeps one auto popover open, and its ancestors", () => {
      const first = createPair();
      const second = createPair();
      const nested = createPair();
      second.panel.append(nested.panel);
      first.panel.showPopover();
      second.panel.showPopover();
      expect(first.panel.matches(":popover-open")).toBe(false);
      nested.panel.showPopover();
      expect(second.panel.matches(":popover-open")).toBe(true);
      expect(nested.panel.matches(":popover-open")).toBe(true);
    });
  });

  describe("focus", () => {
    it("returns focus to the element focused before, when it was inside", () => {
      const { invoker, inside } = createPair();
      invoker.focus();
      invoker.click();
      inside?.focus();
      invoker.click();
      expect(document.activeElement).toBe(invoker);
    });

    it("leaves focus alone when it is outside, or after light dismiss", () => {
      const { panel, invoker, inside } = createPair();
      const elsewhere = document.createElement("button");
      document.body.append(elsewhere);
      invoker.focus();
      panel.showPopover();
      elsewhere.focus();
      panel.hidePopover();
      expect(document.activeElement).toBe(elsewhere);
      invoker.focus();
      panel.showPopover();
      inside?.focus();
      document.body.dispatchEvent(
        new PointerEvent("pointerup", { bubbles: true }),
      );
      expect(document.activeElement).toBe(inside);
    });
  });

  describe("the returned uninstall", () => {
    it("removes the methods, the listeners and the event class", () => {
      const { panel, invoker } = createPair();
      panel.showPopover();
      const listener = vi.fn();
      panel.addEventListener("beforetoggle", listener);
      uninstall();
      expect("showPopover" in panel).toBe(false);
      expect("ToggleEvent" in globalThis).toBe(false);
      // A listener left behind would hide the open panel and announce it.
      invoker.click();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      document.body.dispatchEvent(
        new PointerEvent("pointerup", { bubbles: true }),
      );
      expect(listener).not.toHaveBeenCalled();
      uninstall = installPopoverStandIn();
    });

    it("restores a ToggleEvent that was there before", () => {
      uninstall();
      const existing = class extends Event {};
      Object.assign(globalThis, { ToggleEvent: existing });
      const remove = installPopoverStandIn();
      expect(globalThis.ToggleEvent).not.toBe(existing);
      remove();
      expect(globalThis.ToggleEvent).toBe(existing);
      delete (globalThis as { ToggleEvent?: unknown }).ToggleEvent;
      uninstall = installPopoverStandIn();
    });
  });
});
