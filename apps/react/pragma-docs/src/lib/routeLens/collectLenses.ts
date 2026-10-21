import type { AnyRoute } from "@canonical/router-core";
import { collectFacet } from "../routeFacet/index.js";
import { routeLensFacet } from "./lensFacet.js";
import type { CollectedLens } from "./types.js";

/**
 * Collect every lens `routes` declares, in rail order (ascending `order`).
 *
 * Two invariants throw rather than degrade, because the table is static
 * route data and a bad declaration is a bug the app's own test pins:
 *
 * 1. A LENS IS AN INDEX ROUTE. A route taking params cannot be linked to
 *    without them, so the rail could not reach it.
 * 2. NO TWO LENSES SHARE AN `order`. A tie would leave the rail's order to
 *    the table's key order, which is a declaration convenience, not a ruling.
 */
export const collectLenses = <
  TRoutes extends Readonly<Record<string, AnyRoute>>,
>(
  routes: TRoutes,
): readonly CollectedLens<Extract<keyof TRoutes, string>>[] => {
  const nameByOrder = new Map<number, string>();
  const lenses: CollectedLens<Extract<keyof TRoutes, string>>[] = [];

  for (const { name, route, value } of collectFacet(routeLensFacet, routes)) {
    if (route.url.includes(":")) {
      throw new Error(
        `route "${name}" takes params (${route.url}) and cannot be a lens`,
      );
    }
    const claimed = nameByOrder.get(value.order);
    if (claimed !== undefined) {
      throw new Error(
        `lens order ${value.order} is claimed by both "${claimed}" and "${name}"`,
      );
    }
    nameByOrder.set(value.order, name);
    lenses.push({ ...value, name });
  }

  return lenses.sort((left, right) => left.order - right.order);
};
