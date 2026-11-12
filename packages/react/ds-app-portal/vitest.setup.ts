import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, vitest } from "vitest";

expect.extend(matchers as unknown as Parameters<typeof expect.extend>[0]);

afterEach(() => {
  cleanup();
});

// A class, since an arrow-function mock can't be called with `new`.
class ResizeObserverMock {
  observe = vitest.fn();
  unobserve = vitest.fn();
  disconnect = vitest.fn();
}

global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
