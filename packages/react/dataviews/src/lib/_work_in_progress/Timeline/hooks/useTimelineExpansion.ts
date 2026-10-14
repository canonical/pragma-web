import { useCallback, useMemo, useState } from "react";
import type {
  UseTimelineExpansionProps,
  UseTimelineExpansionResult,
} from "./types.js";

/**
 * Which of a page's events show while it is collapsed, and the commands
 * revealing the rest. `bottom` shows the first `initialVisible` events and
 * reveals downward; `middle` shows the first and last halves of them and
 * reveals the hidden middle from below; `none` shows every event.
 */
export default function useTimelineExpansion({
  count,
  method = "bottom",
  initialVisible = 8,
  step = 4,
}: UseTimelineExpansionProps): UseTimelineExpansionResult {
  const [revealed, setRevealed] = useState(0);
  const showMore = useCallback(() => {
    setRevealed((current) => current + step);
  }, [step]);
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
  const indicatorPosition =
    hiddenCount === 0 ? null : method === "middle" ? "middle" : "bottom";
  return useMemo(
    () => ({
      topCount,
      bottomCount,
      hiddenCount,
      indicatorPosition,
      step,
      showMore,
      showAll,
    }),
    [
      topCount,
      bottomCount,
      hiddenCount,
      indicatorPosition,
      step,
      showMore,
      showAll,
    ],
  );
}
