import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";

expect.extend(matchers as unknown as Parameters<typeof expect.extend>[0]);

afterEach(() => {
  cleanup();
});

// jsdom has no ResizeObserver; the tooltip from @canonical/react-ds-global
// measures its target with one.
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

globalThis.ResizeObserver =
  ResizeObserverMock as unknown as typeof ResizeObserver;
