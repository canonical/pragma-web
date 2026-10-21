/**
 * The Definitions lens's domain constants: the abstraction axis and the
 * filter's no-op default.
 */

import type { LensFilter } from "./types.js";

/** The abstraction axis: the two states `isAbstract` can take, plus the
 * unfiltered default. Chips toggle membership, never a tri-state. */
export const ABSTRACTION_VALUES = ["abstract", "concrete"] as const;

/**
 * The no-op default — the ONLY value that may be a component's initial
 * state. `namespaces: undefined` is impossible here, so the well needs a
 * separate "all prefixes" seed; see `createAllNamespacesFilter`.
 */
export const DEFAULT_LENS_FILTER: LensFilter = {
  text: "",
  abstractions: ABSTRACTION_VALUES,
  namespaces: [],
};
