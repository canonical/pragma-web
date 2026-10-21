import type { AnyRoute } from "@canonical/router-core";
import { collectFacet } from "../routeFacet/index.js";
import routeShortcutFacet from "./routeShortcutFacet.js";
import type { ShortcutAllocation } from "./types.js";

/**
 * Collect `routes`' shortcut allocation: every route's claimed key, and the
 * two lookups anything reading it needs.
 *
 * Collecting the allocation is what makes a collision a failure. A union
 * type of digits rejects an INVALID key but accepts a DUPLICATE one: two
 * claims of `"3"` would compile, resolve first-wins at runtime and render
 * the digit twice. Walking the table and throwing on a repeat closes that.
 *
 * BOTH INVARIANTS THROW, matching the convention every route facet keeps:
 * a half-declared annotation is a bug, not an absence. The cost — a bad
 * allocation crashes the layout rather than degrading — is bounded, because
 * the allocation is STATIC ROUTE DATA a consumer pins in its own route-table
 * test, so an unpinned bad allocation cannot reach production. The
 * alternative (return the duplicates, let a test complain, first-wins at
 * runtime) puts the guarantee entirely in a test someone can delete.
 *
 * 1. NO DOUBLE ALLOCATION — the defect described above.
 * 2. NO SHORTCUT ON A PARAMETERISED ROUTE. `navigate(name)` for a route
 *    taking params would need params the keystroke does not have. It is
 *    also what lets `useLensShortcuts` collapse `NavigateFn`'s overload
 *    intersection soundly — the property is ENFORCED rather than assumed.
 *
 * @param routes - The route table to walk.
 * @returns The allocation, by key and by route.
 * @throws When two routes claim one key, or a route taking params claims one.
 */
export default function collectShortcuts<
  TRoutes extends Readonly<Record<string, AnyRoute>>,
>(routes: TRoutes): ShortcutAllocation<Extract<keyof TRoutes, string>> {
  const byKey = new Map<string, Extract<keyof TRoutes, string>>();
  const byRoute = new Map<Extract<keyof TRoutes, string>, string>();

  for (const { name, route, value } of collectFacet(
    routeShortcutFacet,
    routes,
  )) {
    if (route.url.includes(":")) {
      throw new Error(
        `route "${name}" takes params (${route.url}) and cannot carry a bare shortcut`,
      );
    }
    const claimed = byKey.get(value);
    if (claimed !== undefined) {
      throw new Error(
        `shortcut "${value}" is claimed by both "${claimed}" and "${name}"`,
      );
    }
    byKey.set(value, name);
    byRoute.set(name, value);
  }

  return { byKey, byRoute };
}
