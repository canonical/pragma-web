import type { AnyRoute } from "@canonical/router-core";

/** A route's `meta` bag, exactly as `AnyRoute` declares it. */
export type RouteMeta = Readonly<Record<string, unknown>>;

/**
 * A typed facet on a route's `meta` bag: the key it owns, the authoring
 * side and the reading side, built by `defineFacet`.
 */
export interface RouteFacet<TValue, TKey extends string = string> {
  /** The `meta` key this facet owns. */
  readonly key: TKey;
  /**
   * The authoring side: spread the result into a route's `meta` literal.
   * The value is type-checked here, which is the whole point — do NOT
   * defeat it with an `as` at the call site.
   */
  readonly of: (value: TValue) => { readonly [P in TKey]: TValue };
  /** The reading side: `undefined` when absent, `parse`'s throw when malformed. */
  readonly read: (meta: RouteMeta | undefined) => TValue | undefined;
}

/** A route that carries the facet, with its table key and parsed value. */
export interface FacetBearer<TName extends string, TValue> {
  readonly name: TName;
  readonly route: AnyRoute;
  readonly value: TValue;
}
