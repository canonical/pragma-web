import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// A real browser follows a clicked link, which unloads the test iframe and
// aborts the run. jsdom never navigated, so the suites click links freely.
// Cancel the navigation in the capture phase; React's handlers still run.
document.addEventListener(
  "click",
  (event) => {
    if ((event.target as Element | null)?.closest?.("a[href]")) {
      event.preventDefault();
    }
  },
  true,
);

// Overlays fade in through CSS transitions, so a real browser keeps them out
// of the accessibility tree for a few frames after they open. jsdom applied
// no CSS, so the suites assert synchronously. Turn transitions and
// animations off, as a reduced-motion user would see them.
const noMotion = document.createElement("style");
noMotion.textContent =
  "*, *::before, *::after { transition: none !important; animation: none !important; }";
document.head.append(noMotion);

// A real browser provides ResizeObserver, so nothing is stubbed here.
// Storage persists between tests in one page, so it is cleared after each.
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
