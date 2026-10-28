import type { DiagramRoute } from "./types.js";

/**
 * Select the routes of one line the map draws. A route and its reverse run
 * over the same track, so only the first of each pair is drawn; a route with
 * no reverse, such as each line of a ring run by two lines in opposite
 * directions, is always drawn.
 *
 * Routes are paired by label: a route is the reverse of an earlier one when
 * the earlier route's `reverseLabel` names it, labels being unique within a
 * line.
 *
 * @param routes - The line's routes, in the graph's order.
 * @returns The routes to draw, in the same order.
 */
export default function selectDrawnRoutes(
  routes: readonly DiagramRoute[],
): readonly DiagramRoute[] {
  const drawn: DiagramRoute[] = [];
  for (const route of routes) {
    if (!drawn.some((kept) => kept.reverseLabel === route.label)) {
      drawn.push(route);
    }
  }
  return drawn;
}
