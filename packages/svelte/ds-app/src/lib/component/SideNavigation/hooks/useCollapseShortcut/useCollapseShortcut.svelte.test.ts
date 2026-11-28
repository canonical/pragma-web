// Ported from @canonical/react-ds-app SideNavigation useCollapseShortcut

import { tick } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import Harness from "./test.harness.svelte";

const press = (
  target: EventTarget,
  init: KeyboardEventInit = { key: "b", ctrlKey: true },
) => {
  target.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }),
  );
};

describe("useCollapseShortcut", () => {
  const cleanups: (() => void)[] = [];
  afterEach(() => {
    for (const cleanup of cleanups.splice(0)) cleanup();
  });

  it("does not attach a listener by default (reserved, disabled)", async () => {
    const ontrigger = vi.fn();
    await render(Harness, { ontrigger });
    press(window);
    expect(ontrigger).not.toHaveBeenCalled();
  });

  it("does not attach a listener when explicitly disabled", async () => {
    const ontrigger = vi.fn();
    await render(Harness, { condition: false, ontrigger });
    press(window);
    expect(ontrigger).not.toHaveBeenCalled();
  });

  it("calls ontrigger on Ctrl+B when the condition holds", async () => {
    const ontrigger = vi.fn();
    await render(Harness, { condition: true, ontrigger });
    press(window);
    expect(ontrigger).toHaveBeenCalledOnce();
  });

  it("prevents the browser default for the matched chord", async () => {
    await render(Harness, { condition: true, ontrigger: vi.fn() });
    const event = new KeyboardEvent("keydown", {
      key: "b",
      ctrlKey: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("matches the key case-insensitively", async () => {
    const ontrigger = vi.fn();
    await render(Harness, { condition: true, ontrigger });
    press(window, { key: "B", ctrlKey: true });
    expect(ontrigger).toHaveBeenCalledOnce();
  });

  it("ignores the key without the Ctrl modifier, even when the condition holds", async () => {
    const ontrigger = vi.fn();
    await render(Harness, { condition: true, ontrigger });
    press(window, { key: "b", ctrlKey: false });
    expect(ontrigger).not.toHaveBeenCalled();
  });

  it("ignores an unrelated key, even with Ctrl held", async () => {
    const ontrigger = vi.fn();
    await render(Harness, { condition: true, ontrigger });
    press(window, { key: "s", ctrlKey: true });
    expect(ontrigger).not.toHaveBeenCalled();
  });

  it("ignores the chord when another modifier joins it (Ctrl+Shift+B)", async () => {
    const ontrigger = vi.fn();
    await render(Harness, { condition: true, ontrigger });
    press(window, { key: "b", ctrlKey: true, shiftKey: true });
    expect(ontrigger).not.toHaveBeenCalled();
  });

  it("ignores the chord when its target is an editable element (Ctrl+B is bold there)", async () => {
    const ontrigger = vi.fn();
    await render(Harness, { condition: true, ontrigger });
    const input = document.createElement("input");
    document.body.append(input);
    cleanups.push(() => input.remove());
    press(input);
    expect(ontrigger).not.toHaveBeenCalled();
  });

  it("ignores the chord when its target is contenteditable", async () => {
    const ontrigger = vi.fn();
    await render(Harness, { condition: true, ontrigger });
    const editor = document.createElement("div");
    editor.setAttribute("contenteditable", "true");
    document.body.append(editor);
    cleanups.push(() => editor.remove());
    press(editor);
    expect(ontrigger).not.toHaveBeenCalled();
  });

  it("detaches the listener when the condition flips back to false", async () => {
    const ontrigger = vi.fn();
    const page = await render(Harness, { condition: true, ontrigger });
    await page.rerender({ condition: false });
    await tick();
    press(window);
    expect(ontrigger).not.toHaveBeenCalled();
  });

  it("detaches the listener on unmount", async () => {
    const ontrigger = vi.fn();
    const page = await render(Harness, { condition: true, ontrigger });
    await page.unmount();
    press(window);
    expect(ontrigger).not.toHaveBeenCalled();
  });
});
