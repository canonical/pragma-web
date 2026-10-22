import type { FetchFunction } from "relay-runtime";
import { type Mock, vi } from "vitest";

/**
 * Create a Relay fetch function that records its calls and never settles.
 *
 * The returned promise stays pending forever, so no response ever reaches
 * the store and a call is observable only through the mock's call log: any
 * call means "the network was hit". Pass it as `createEnvironment`'s
 * `fetchFn` to count network dispatches without a server.
 *
 * @returns A vitest mock that implements `FetchFunction`.
 */
export default function createFetchSpy(): Mock<FetchFunction> {
  return vi.fn<FetchFunction>(() => new Promise<never>(() => {}));
}
