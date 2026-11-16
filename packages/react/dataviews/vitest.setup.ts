import "@testing-library/jest-dom/vitest";
import standInDialogs from "./testing/standInDialogs.js";

/**
 * jsdom has no ResizeObserver, and the design system's ContextualMenu fits
 * itself to the window through one as it mounts, so a table whose header
 * menu opens would throw as the menu mounts. A browser API the environment
 * lacks is stood in for here, as the design system's own tests do: an
 * observer that observes nothing and never reports. Tests that measure stub
 * their own.
 */
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

standInDialogs();

/**
 * jsdom hides every popover, since it never matches `:popover-open`, so a
 * menu opened through the Popover stand-in would be inaccessible. A panel
 * holds a `menu` role only while open, so tests draw those panels; a suite
 * on the node environment has no document.
 */
if (typeof document !== "undefined") {
  const showPopovers = document.createElement("style");
  showPopovers.textContent =
    "[popover]:has(> [role='menu']) { display: block !important; }";
  document.head.append(showPopovers);
}
