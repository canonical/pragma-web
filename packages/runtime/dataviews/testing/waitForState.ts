import { onTestFailed, TestRunner } from "vitest";

/**
 * Resolve once `check` holds: checked now, then on each notification. No
 * ceiling of its own; a test that fails while waiting names `awaited`, and
 * once the test is aborted, notifications are ignored.
 *
 * @note Impure: subscribes until the state is reached or the test fails.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function waitForState(
  subscribe: (listener: () => void) => () => void,
  check: () => boolean,
  awaited: string,
): Promise<void> {
  if (check()) {
    return Promise.resolve();
  }
  const reached = Promise.withResolvers<void>();
  // A timed-out test aborts before its cleanup can bring the state.
  const signal = TestRunner.getCurrentTest()?.context.signal;
  let pending = true;
  let unsubscribe: (() => void) | undefined;
  unsubscribe = subscribe(() => {
    if (pending && !signal?.aborted && check()) {
      pending = false;
      unsubscribe?.();
      reached.resolve();
    }
  });
  // A store may notify as it subscribes, before `unsubscribe` is set.
  if (!pending) {
    unsubscribe();
  }
  onTestFailed(() => {
    if (pending) {
      pending = false;
      unsubscribe?.();
      throw new Error(`Still waiting on ${awaited}.`);
    }
  });
  return reached.promise;
}
