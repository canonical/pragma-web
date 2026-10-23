import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";

expect.extend(matchers as unknown as Parameters<typeof expect.extend>[0]);

afterEach(() => {
  cleanup();
});

/*
  jsdom 28 implements HTMLDialogElement but not the top layer: `showModal` and
  `close` are absent. Stub them as the platform behaves where the palette
  depends on it: `showModal` throws on an open dialog, opens it and runs the
  dialog focusing steps (the first focusable descendant takes the focus);
  `close` closes an open dialog and fires `close`. jsdom lays nothing out, so
  `scrollIntoView` is absent too, and is stubbed as a no-op. The SSR project
  runs in node, where there is no DOM to stub.
*/
if (typeof HTMLDialogElement !== "undefined") {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(
      this: HTMLDialogElement,
    ): void {
      if (this.open) {
        throw new DOMException(
          "The dialog is already open.",
          "InvalidStateError",
        );
      }
      this.open = true;
      this.querySelector<HTMLElement>(
        "input, button, select, textarea, a[href], [tabindex]",
      )?.focus();
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close(
      this: HTMLDialogElement,
      returnValue?: string,
    ): void {
      if (!this.open) return;
      this.open = false;
      if (returnValue !== undefined) this.returnValue = returnValue;
      this.dispatchEvent(new Event("close"));
    };
  }
}
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView(): void {};
}
