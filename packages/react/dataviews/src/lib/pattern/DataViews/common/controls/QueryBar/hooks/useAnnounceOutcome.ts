import type { Count } from "@canonical/dataviews-core";
import { useCallback, useEffect, useRef } from "react";
import { readAnswerCount } from "../utils/index.js";
import type {
  UseAnnounceOutcomeProps,
  UseAnnounceOutcomeResult,
} from "./types.js";

/**
 * Say a commit's outcome through the root's announcer once its result
 * lands, worded with the result's count: at once when nothing is pending,
 * else when the provider next settles. A later outcome replaces one still
 * waiting, so only the last is said.
 *
 * @returns The function that says an outcome.
 * @note Impure: subscribes to the provider's state while an outcome waits.
 */
export default function useAnnounceOutcome(
  ...[provider, announce]: UseAnnounceOutcomeProps
): UseAnnounceOutcomeResult {
  const waiting = useRef<((count: Count) => string) | null>(null);

  const sayIfSettled = useCallback((): void => {
    const words = waiting.current;
    if (words === null) return;
    const count = readAnswerCount(provider.state.get());
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
