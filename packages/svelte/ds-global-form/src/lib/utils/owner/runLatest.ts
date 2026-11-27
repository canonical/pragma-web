import type { LatestOutcome } from "./types.js";

/**
 * Wraps asynchronous work so only its latest run counts: starting a run, or
 * cancelling, aborts the previous run's signal, and an aborted run resolves as
 * `superseded` whatever its work returned.
 * @note Pure: the returned runner holds the current run's controller.
 */
export default function runLatest<Input, Output>(
  work: (input: Input, signal: AbortSignal) => Promise<Output>,
): {
  /** Starts a run, superseding the previous one. */
  run: (input: Input) => Promise<LatestOutcome<Output>>;
  /** Supersedes the current run, if any. */
  cancel: () => void;
} {
  let controller = new AbortController();
  const cancel = () => {
    controller.abort();
    controller = new AbortController();
  };
  return {
    async run(input) {
      cancel();
      const { signal } = controller;
      try {
        const value = await work(input, signal);
        return signal.aborted
          ? { status: "superseded" }
          : { status: "done", value };
      } catch (error) {
        return signal.aborted
          ? { status: "superseded" }
          : { status: "failed", error };
      }
    },
    cancel,
  };
}
