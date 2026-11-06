import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

// jest-dom 7.0.1 augments the single-generic vitest 4 `Assertion<T>`; vitest 5
// declares `Assertion<R, T>`, so that merge fails and the matchers fall back to
// vitest's own, narrower signatures. Restore them against the current shape
// until jest-dom ships vitest 5 support. jest-dom's second parameter is what a
// matcher returns, so it takes R: a matcher awaited under `resolves` is typed
// as the promise it returns.
declare module "vitest" {
  interface Assertion<R extends void | Promise<void> = void, T = unknown>
    extends TestingLibraryMatchers<unknown, R> {}
}
