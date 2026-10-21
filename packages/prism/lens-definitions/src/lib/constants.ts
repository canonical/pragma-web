/**
 * The Definitions lens's domain constants: the abstraction axis, the
 * filter's no-op default and the catalog key of each property kind.
 */

import type { MessageKey } from "./i18n/index.js";
import type { LensFilterState } from "./types.js";

/** The abstraction axis: the two states `isAbstract` can take, plus the
 * unfiltered default. Chips toggle membership, never a tri-state. */
export const ABSTRACTION_VALUES = ["abstract", "concrete"] as const;

/**
 * The no-op default — the ONLY value that may be a component's initial
 * state. It carries no `namespaces`, which every consumer reads as "no chip
 * pressed"; `resolveFilter` lights the graph's own prefixes from it.
 */
export const DEFAULT_LENS_FILTER: LensFilterState = {
  text: "",
  abstractions: ABSTRACTION_VALUES,
};

/**
 * The catalog key each contract `PropertyKind` reads as, so a property's
 * kind reaches the reader through the translator like every other word.
 */
export const PROPERTY_KIND_MESSAGES = {
  ANNOTATION: "kind.annotation",
  DATATYPE: "kind.datatype",
  OBJECT: "kind.object",
} as const satisfies Readonly<Record<string, MessageKey>>;
