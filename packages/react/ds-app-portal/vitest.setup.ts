import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, vitest } from "vitest";

expect.extend(matchers as unknown as Parameters<typeof expect.extend>[0]);

afterEach(() => {
  cleanup();
});

// A class, not `vitest.fn().mockImplementation(arrowFn)`: consumers call
// `new ResizeObserver(callback)`, and an arrow function is not a constructor.
class ResizeObserverMock {
  observe = vitest.fn();
  unobserve = vitest.fn();
  disconnect = vitest.fn();
}

global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
