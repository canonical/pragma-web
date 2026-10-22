import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";

expect.extend(matchers as unknown as Parameters<typeof expect.extend>[0]);

// jsdom implements no `window.matchMedia`, but `usePreferredTheme` (the
// rail's ThemeSelector) resolves its initial value through it whenever a
// `window` exists. A minimal always-false stub is the standard shim; node-
// environment test files (`@vitest-environment node`) have no window and
// exercise the hook's server branch instead, so the stub is jsdom-only.
if (typeof window !== "undefined" && typeof window.matchMedia === "undefined") {
  const matchMediaStub = (query: string): MediaQueryList =>
    ({
      addEventListener: () => {},
      addListener: () => {},
      dispatchEvent: () => false,
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: () => {},
      removeListener: () => {},
    }) as unknown as MediaQueryList;
  window.matchMedia = matchMediaStub;
}

afterEach(() => {
  cleanup();
});
