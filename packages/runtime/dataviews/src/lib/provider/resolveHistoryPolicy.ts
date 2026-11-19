import type { HistoryMode } from "../location/index.js";
import { DEFAULT_HISTORY, FIXED_HISTORY } from "./constants.js";
import type {
  HistoryPolicy,
  QueryTransition,
  TransitionHistory,
} from "./types.js";

/**
 * Resolve the provider's history policy to the mode of every cause. One
 * mode sets every transition a policy may name; a record overrides the
 * defaults per transition; the causes no policy names keep their fixed
 * modes. Spelled member by member, so a transition the policy gains is
 * listed here or fails to compile.
 */
export default function resolveHistoryPolicy(
  policy: HistoryPolicy | undefined,
): TransitionHistory {
  const readMode = (transition: QueryTransition): HistoryMode =>
    typeof policy === "string"
      ? policy
      : (policy?.[transition] ?? DEFAULT_HISTORY[transition]);
  return Object.freeze({
    filter: readMode("filter"),
    search: readMode("search"),
    sort: readMode("sort"),
    group: readMode("group"),
    window: readMode("window"),
    view: readMode("view"),
    ...FIXED_HISTORY,
  });
}
