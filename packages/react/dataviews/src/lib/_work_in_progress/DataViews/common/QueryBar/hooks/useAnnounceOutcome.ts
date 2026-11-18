import type { Count, DataViewsState } from "@canonical/dataviews-core";
import { useCallback, useEffect, useRef } from "react";
import type {
  UseAnnounceOutcomeProps,
  UseAnnounceOutcomeResult,
} from "./types.js";

/** What nobody has counted. */
const UNCOUNTED: Count = Object.freeze({ kind: "unknown" });

/** The count of the result answering the applied query, once it has landed. */
const readSettledCount = (state: DataViewsState<object>): Count | null => {
  if (state.pendingRequestId !== null) return null;
  // A count that answers another query, as one kept beside a failure or a
  // withheld query, says nothing of this one.
  if (!state.resultMatchesQuery || state.result.status !== "ready") {
    return UNCOUNTED;
  }
  return state.result.counts?.matched ?? UNCOUNTED;
};

/**
 * Say a commit's outcome through the root's announcer once its result
 * lands, worded with the result's count: at once when nothing is pending,
 * else when the provider next settles. A later outcome replaces one still
 * waiting, so only the last is said.
 *
 * @param props - The provider and the root's announcer.
 * @returns The function that says an outcome.
 * @note Impure: subscribes to the provider's state while an outcome waits.
 */
export default function useAnnounceOutcome({
  provider,
  announce,
}: UseAnnounceOutcomeProps): UseAnnounceOutcomeResult {
  const waiting = useRef<((count: Count) => string) | null>(null);

  const sayIfSettled = useCallback((): void => {
    const words = waiting.current;
    if (words === null) return;
    const count = readSettledCount(provider.state.get());
    if (count === null) return;
    waiting.current = null;
    announce(words(count));
  }, [provider, announce]);

  useEffect(
    () => provider.state.subscribe(sayIfSettled),
    [provider, sayIfSettled],
  );

  return useCallback(
    (words) => {
      waiting.current = words;
      sayIfSettled();
    },
    [sayIfSettled],
  );
}
