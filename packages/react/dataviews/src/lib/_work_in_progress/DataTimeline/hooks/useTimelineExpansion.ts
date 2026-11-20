import { useCallback, useMemo, useState } from "react";
import { DEFAULT_EXPANSION_STEP } from "../constants.js";
import type {
  UseTimelineExpansionProps,
  UseTimelineExpansionResult,
} from "./types.js";

/**
 * Which of a page's events show while it is collapsed, and the commands
 * revealing the rest. `bottom` shows the first `initialVisible` events and
 * reveals downward; `middle` shows the first and last halves of them and
 * reveals the hidden middle from below; `none` shows every event. Once every
 * event on the page shows, show more asks the collection for the events past
 * it, and every event that arrives is shown: the collection is asked for
 * only as many as one step reveals.
 */
export default function useTimelineExpansion({
  count,
  method = "bottom",
  initialVisible = 8,
  step = DEFAULT_EXPANSION_STEP,
  requestMore = null,
}: UseTimelineExpansionProps): UseTimelineExpansionResult {
  const [revealed, setRevealed] = useState(0);
  const showAll = useCallback(() => {
    setRevealed(Number.POSITIVE_INFINITY);
  }, []);
  const visible = Math.max(0, initialVisible);
  const topCount =
    method === "middle" ? Math.min(Math.ceil(visible / 2), count) : 0;
  const initialBottom =
    method === "none"
      ? count
      : method === "middle"
        ? Math.floor(visible / 2)
        : visible;
  const bottomCount = Math.min(initialBottom + revealed, count - topCount);
  const hiddenCount = count - topCount - bottomCount;
  const fetchesMore = hiddenCount === 0 && requestMore !== null;
  const showMore = useCallback(() => {
    if (fetchesMore) {
      // The window grows by one step, so whatever arrives is shown whole.
      setRevealed(Number.POSITIVE_INFINITY);
      requestMore?.();
      return;
    }
    setRevealed((current) => current + step);
  }, [fetchesMore, requestMore, step]);
  const indicatorPosition =
    hiddenCount > 0
      ? method === "middle"
        ? "middle"
        : "bottom"
      : fetchesMore
        ? "bottom"
        : null;
  return useMemo(
    () => ({
      topCount,
      bottomCount,
      hiddenCount,
      indicatorPosition,
      step,
      fetchesMore,
      showMore,
      showAll,
    }),
    [
      topCount,
      bottomCount,
      hiddenCount,
      indicatorPosition,
      step,
      fetchesMore,
      showMore,
      showAll,
    ],
  );
}
