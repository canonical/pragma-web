import type { Count, DataViewsState } from "@canonical/dataviews-core";
import { useDataViewsValue } from "../../../../../../hooks/index.js";
import { UNCOUNTED } from "../constants.js";
import { readAnswerCount } from "../utils/index.js";
import type {
  UseAnswerCountStandInProps,
  UseAnswerCountStandInResult,
} from "./types.js";

/** The count answering the applied query; unknown while pending. */
const readLiveCount = (state: DataViewsState<object>): Count =>
  readAnswerCount(state) ?? UNCOUNTED;

/** Two counts that say the same. */
const isSameCount = (a: Count, b: Count): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

/**
 * The live count of the records the applied query matches, with how
 * exactly the source counted them, read narrowly so a result that counts
 * the same renders nothing. It stands in for the store's answer group
 * until that lands, with the same reading.
 *
 * @returns The count; unknown while none answers the applied query.
 */
export default function useAnswerCountStandIn(
  ...[provider]: UseAnswerCountStandInProps
): UseAnswerCountStandInResult {
  return useDataViewsValue(provider.state, {
    select: readLiveCount,
    isEqual: isSameCount,
  });
}
