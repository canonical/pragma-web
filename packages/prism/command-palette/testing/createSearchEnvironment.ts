import { createMockEnvironment, type MockEnvironment } from "relay-test-utils";
import { vi } from "vitest";

/**
 * Create a Relay mock environment a test answers each search of by hand,
 * through `environment.mock`: every operation stays pending until the test
 * resolves or rejects it.
 *
 * @returns The mock environment.
 * @note Impure: stubs the global `jest`, since relay-test-utils wraps the
 *   mock environment's methods in `jest.fn` when NODE_ENV is "test", and
 *   vitest's `vi` offers the same surface.
 */
export default function createSearchEnvironment(): MockEnvironment {
  vi.stubGlobal("jest", vi);
  return createMockEnvironment();
}
