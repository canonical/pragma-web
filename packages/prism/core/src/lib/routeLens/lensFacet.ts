import { defineFacet } from "../routeFacet/index.js";
import { ROUTE_LENS_META_KEY } from "./constants.js";
import type { LensEntry } from "./types.js";

/**
 * Check a raw `meta` value is a well-formed lens declaration, and return it
 * by identity. Each malformed field throws its own message naming the key,
 * because a route that half-declares a lens is a bug, not an absence.
 */
const parseLensEntry = (value: unknown, key: string): LensEntry => {
  if (typeof value !== "object" || value === null) {
    throw new Error(`route meta ${key} is not an object`);
  }
  const { label, icon, order, tier } = value as Record<string, unknown>;
  if (typeof label !== "string" || label.length === 0) {
    throw new Error(`route meta ${key}.label is not a non-empty string`);
  }
  if (typeof icon !== "function") {
    throw new Error(`route meta ${key}.icon is not a component`);
  }
  if (!Number.isInteger(order)) {
    throw new Error(`route meta ${key}.order is not a finite integer`);
  }
  if (tier !== 1 && tier !== 2) {
    throw new Error(`route meta ${key}.tier is not 1 or 2`);
  }
  return value as LensEntry;
};

/**
 * The lens facet: a lens's index route declares the lens on its own `meta`
 * with `routeLensFacet.of({ label, icon, order, tier })`, and `read` returns
 * the declaration, `undefined` when the route declares none, or throws when
 * the declaration is malformed.
 */
export const routeLensFacet = defineFacet<
  LensEntry,
  typeof ROUTE_LENS_META_KEY
>(ROUTE_LENS_META_KEY, parseLensEntry);
