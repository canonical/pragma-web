import type { Count, DataViewsState } from "@canonical/dataviews-core";
import { UNCOUNTED } from "../constants.js";

/**
 * The count of the records answering the applied query, as exactly as the
 * source counted them: null while a request is pending; unknown where the
 * result failed, counts nothing, or answers another query, as one kept
 * beside a failure or a withheld query does. The one reading of the count
 * the bar both shows and says. Pure.
 *
 * @param state - The provider's state.
 * @returns The count, or null while pending.
 */
export default function readAnswerCount(
  state: DataViewsState<object>,
): Count | null {
  if (state.pendingRequestId !== null) return null;
  if (!state.resultMatchesQuery || state.result.status !== "ready") {
    return UNCOUNTED;
  }
  return state.result.counts?.matched ?? UNCOUNTED;
}
