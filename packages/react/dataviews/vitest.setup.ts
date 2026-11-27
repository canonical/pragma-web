import "@testing-library/jest-dom/vitest";
import standInDialogs from "./testing/standInDialogs.js";

/** jsdom has no ResizeObserver; tests that measure stub their own. */
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

standInDialogs();
