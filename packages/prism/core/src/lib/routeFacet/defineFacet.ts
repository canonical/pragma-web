import type { RouteFacet } from "./types.js";

/**
 * Define a facet from its key and its parser: ONE place per tenant for the
 * key, the value shape, and the assertion.
 *
 * Route `meta` is `Readonly<Record<string, unknown>>` and the router never
 * serialises it (`dehydrate()` emits routing state only), so anything may
 * live there at the acknowledged cost of `unknown`-typed access. Without
 * this helper each tenant hand-writes its own reader and each AUTHORING
 * site writes a bare computed key — which type-checks the KEY but never the
 * VALUE: `{ [ROUTE_LENS_META_KEY]: 42 }` compiles. `of()` closes that
 * hole, because the value is checked where it is written; `read()` keeps
 * the assertion in one place for where it is consumed.
 *
 * THE CONVENTION THIS HELPER KEEPS: absence is fine (`undefined`),
 * presence-and-malformed THROWS — a route that half-declares a facet is a
 * bug, not an absence. That is why `parse` is a parser that throws the
 * tenant's OWN message rather than a boolean `value is T` guard: a guard
 * would collapse a tenant's distinct diagnostics (the lens facet's "label
 * is not a non-empty string", "icon is not a component", …) into one
 * generic failure, and those messages are pinned by each tenant's tests.
 *
 * `parse` receives the raw `unknown` and the key (so the tenant's message
 * can name it without repeating the literal) and either returns the value —
 * BY IDENTITY, callers rely on `toBe` — or throws.
 *
 * `const TKey` keeps the key a literal type through inference, so `of()`
 * produces a precisely-keyed object rather than an index signature.
 *
 * @param key - The `meta` key the facet owns.
 * @param parse - Returns the value by identity, or throws the tenant's message.
 * @returns The facet's key, authoring side and reading side.
 */
export const defineFacet = <TValue, const TKey extends string = string>(
  key: TKey,
  parse: (value: unknown, key: TKey) => TValue,
): RouteFacet<TValue, TKey> => ({
  key,
  of: (value) =>
    // A computed key over a generic widens to an index signature; the cast
    // restores the literal key the signature already promises.
    ({ [key]: value }) as unknown as { readonly [P in TKey]: TValue },
  read: (meta) => {
    const raw = meta?.[key];
    return raw === undefined ? undefined : parse(raw, key);
  },
});
