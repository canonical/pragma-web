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

// A real browser provides ResizeObserver and matchMedia, so nothing is
// stubbed here. Storage persists between tests in one page, so it is cleared
// after each test. No ds-app test sets a cookie, so cookies are left alone.
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
