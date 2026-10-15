import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, vitest } from "vitest";

expect.extend(matchers as unknown as Parameters<typeof expect.extend>[0]);

// Cleanup the DOM after each test, and drop the observers the tests created
// so `ResizeObserverMock.instances` only ever holds the current test's.
afterEach(() => {
  cleanup();
  ResizeObserverMock.instances.length = 0;
});

// jsdom ships no ResizeObserver. A class, not `vitest.fn().mockImplementation(
// arrowFn)`: consumers call `new ResizeObserver(callback)`, and an arrow
// function is not a constructor. The mock records every instance and its
// callback, so a test can inspect `observe`/`disconnect` calls and fire the
// callback through `trigger()` the way a real observer fires on a resize:
//
//   type Mock = { observe: MockFn; trigger(): void };
//   const observers = (ResizeObserver as unknown as { instances: Mock[] }).instances;
class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];

  readonly callback: ResizeObserverCallback;
  observe = vitest.fn();
  unobserve = vitest.fn();
  disconnect = vitest.fn();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ResizeObserverMock.instances.push(this);
  }

  /** Fire the constructor callback, as a real observer would on a resize. */
  trigger(entries: ResizeObserverEntry[] = []): void {
    this.callback(entries, this as unknown as ResizeObserver);
  }
}

global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
