/**
 * The provider domain's constants: the tables the query path reads a
 * transition's history from — how each transition enters history by
 * default, and how the causes no policy names do.
 */

import type { HistoryMode } from "../location/index.js";
import type { QueryTransition, TransitionCause } from "./types.js";

/**
 * How each transition enters history unless the policy says otherwise:
 * search replaces, so typing never floods history; every other transition
 * is a step Back returns from.
 */
export const DEFAULT_HISTORY: Readonly<Record<QueryTransition, HistoryMode>> =
  Object.freeze({
    filter: "push",
    search: "replace",
    sort: "push",
    group: "push",
    window: "push",
    view: "push",
  });

/**
 * How the causes no policy names enter history: a collapse has no spelling
 * and the location's own adoption is never written back, so neither enters
 * it; a reset returns to the declared state, reverting returns to a saved
 * view's baseline, and leaving a view drops only its id — none of them a
 * step taken — so each replaces.
 */
export const FIXED_HISTORY: Readonly<
  Record<Exclude<TransitionCause, QueryTransition>, HistoryMode | null>
> = Object.freeze({
  collapse: null,
  adopt: null,
  reset: "replace",
  revert: "replace",
});
