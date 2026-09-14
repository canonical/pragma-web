import { type MockInstance, vi } from "vitest";
import {
  type PresentationStore,
  WRITE_DELAY,
} from "../src/lib/presentation/index.js";

/**
 * Send the presentation changes still gathering and wait for each write to
 * settle. The case runs on a faked clock: moving it past the delay sends
 * the writes, and the case waits for the writes, never for a duration.
 *
 * @note Impure: advances the faked clock.
 */
export default async function flushPresentation(
  writes: MockInstance<PresentationStore["patchPresentation"]>,
): Promise<void> {
  await vi.advanceTimersByTimeAsync(WRITE_DELAY);
  await Promise.allSettled(writes.mock.results.map(({ value }) => value));
}
