/**
 * The Definitions lens's EPHEMERAL view state — the one vocabulary the
 * rail, the well and the mode strip's controls all read.
 *
 * Two axes, both derived from what an `OntologyClass` ACTUALLY carries
 * (`lensFilter.test.ts` pins the shape contract):
 *
 * - `text` — a case-insensitive substring over a term's label OR its
 *   prefixed URI. Rail-only by contract: the search never touches the
 *   graph.
 * - `abstraction` / `namespaces` — the per-class facets the graph really
 *   has (`isAbstract`, `namespace`). There is no lifecycle, status or
 *   channel field on `OntologyClass`, and the `Tag` vocabulary (which does
 *   carry a channel facet) applies to UIBlocks, not to ontology classes —
 *   so this module encodes abstractness and provenance, and names them for
 *   what they are rather than dressing them as maturity.
 *
 * EVERY value here is client-only transient state whose INITIAL value is a
 * no-op: `DEFAULT_LENS_FILTER` matches everything and dims nothing, so the
 * server render and the client's first paint are byte-identical. Nothing
 * in this module may ever be seeded from `localStorage`, `window` or the
 * query string — that would break hydration (the SSR determinism rule).
 */

import { DEFAULT_LENS_FILTER } from "./constants.js";
import type { Abstraction, LensFilter } from "./types.js";

/** Which axis value a class sits on — total over `isAbstract`. */
export const classifyAbstraction = (isAbstract: boolean): Abstraction =>
  isAbstract ? "abstract" : "concrete";

/**
 * The default with every known prefix lit. Callers build this from the
 * ontologies the query returned, so a new ontology needs no code change.
 * Pure and order-preserving, so two calls with the same input are equal.
 */
export const createAllNamespacesFilter = (
  prefixes: readonly string[],
): LensFilter => ({
  ...DEFAULT_LENS_FILTER,
  namespaces: [...prefixes],
});

/**
 * Resolve the EFFECTIVE filter against the ontologies that actually exist.
 *
 * An untouched filter carries no namespaces, because the shared state
 * (`LensFilter`) sits above the query and cannot know the graph's
 * prefixes. Every consumer reads that the same way — "no chip has been
 * pressed, so show everything" — and this is the one place that reading
 * lives, so the rail, the well and the mode strip's toolbar can never
 * disagree about what an untouched filter means.
 *
 * Pure, and a no-op on the default value, which is what keeps the server
 * render and the client's first paint byte-identical.
 *
 * IDENTITY MATTERS HERE. The well is memoised on `filter.namespaces`'s
 * reference (a keystroke in the search box must not re-render 29 nodes),
 * so this returns the caller's OWN `prefixes` array rather than a copy —
 * a fresh array per render would silently defeat that memo.
 */
export const resolveFilter = (
  filter: LensFilter,
  prefixes: readonly string[],
): LensFilter =>
  filter.namespaces.length === 0 ? { ...filter, namespaces: prefixes } : filter;

/** Normalise raw input from the search box into the comparable form. */
export const normalizeFilterText = (raw: string): string =>
  raw.trim().toLowerCase();

/**
 * Does a term's TEXT match? Case-insensitive substring over the label or
 * the prefixed URI. An empty query matches
 * everything (the no-op default's whole point).
 */
export const matchesText = (
  text: string,
  label: string | null | undefined,
  prefixed: string,
): boolean =>
  text.length === 0 ||
  (label ?? prefixed).toLowerCase().includes(text) ||
  prefixed.toLowerCase().includes(text);

/**
 * Does a CLASS pass the chip axes? Text is deliberately NOT consulted:
 * the chips govern the graph, the search box governs the rail, and mixing
 * them would let a rail search silently re-shape the graph.
 */
export const matchesChips = (
  filter: LensFilter,
  isAbstract: boolean,
  prefix: string,
): boolean =>
  filter.abstractions.includes(classifyAbstraction(isAbstract)) &&
  filter.namespaces.includes(prefix);

/** Toggle one value in an allow-list, preserving the canonical order. */
export const toggleIn = <Value extends string>(
  values: readonly Value[],
  ordered: readonly Value[],
  value: Value,
): readonly Value[] =>
  values.includes(value)
    ? values.filter((candidate) => candidate !== value)
    : ordered.filter(
        (candidate) => candidate === value || values.includes(candidate),
      );
