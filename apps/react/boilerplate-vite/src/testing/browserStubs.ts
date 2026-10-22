import { vi } from "vitest";

/**
 * jsdom implements no `matchMedia`. `usePreferredTheme` queries it, and the
 * side navigation does after mounting; this answers every query with no
 * match, as a wide screen with no preferences would.
 */
export function installMatchMedia(): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

/**
 * jsdom implements no part of the dialog API: `show`, `showModal` and `close`
 * are undefined. These stubs are the minimum the side panel and the modal
 * need: reflect the `open` attribute, and dispatch `close` as the platform
 * does, so every close goes through the dialog's `close` event.
 */
export function installDialogStubs(): void {
  HTMLDialogElement.prototype.show = function show(this: HTMLDialogElement) {
    this.toggleAttribute("open", true);
  };
  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement,
  ) {
    this.toggleAttribute("open", true);
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) {
      return;
    }
    this.toggleAttribute("open", false);
    this.dispatchEvent(new Event("close"));
  };
}

/**
 * jsdom implements no `ResizeObserver`. The design system's tooltips observe
 * their target's size; this observer never reports, as an element that never
 * resizes would not.
 */
export function installResizeObserver(): void {
  globalThis.ResizeObserver = class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}
