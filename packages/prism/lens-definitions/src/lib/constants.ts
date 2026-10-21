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
 * state. Its `namespaces` is empty, which every consumer reads as "no chip
 * pressed"; `resolveFilter` lights the graph's own prefixes from it.
 */
export const DEFAULT_LENS_FILTER: LensFilter = {
  text: "",
  abstractions: ABSTRACTION_VALUES,
  namespaces: [],
};
