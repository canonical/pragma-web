import type { NetworkLineQuery$data } from "../../../relay/__generated__/NetworkLineQuery.graphql.js";
import type {
  LineView,
  NodeRef,
  StripDirection,
  StripStop,
  StripView,
} from "./types.js";

type LineNode = NonNullable<NetworkLineQuery$data["node"]>;
type LineRoute = NonNullable<LineNode["routes"]>[number];

/** Read a route's calls, in position order, as the strip's stops. */
const readStops = (route: LineRoute, lineUri: string): StripStop[] =>
  [...route.calls]
    .sort((a, b) => a.position - b.position)
    .map(({ stop }) => ({
      curie: stop._meta.curie,
      title: stop._meta.title,
      isInterchange: stop.__typename === "Interchange",
      transferMinutes: stop.transferMinutes ?? undefined,
      connections: stop.servesLine
        .filter((line) => line.uri !== lineUri)
        .map((line) => ({
          curie: line._meta.curie,
          title: line._meta.title,
          code: line.code,
          colour: line.colour,
        })),
    }));

/** Read one direction of a strip. */
const readDirection = (route: LineRoute, lineUri: string): StripDirection => ({
  label: route.label,
  stops: readStops(route, lineUri),
});

/**
 * Pair a line's routes into strips: each route the line draws, in the
 * graph's order, with its reverse beside it. A route and its reverse run
 * over the same track, so the reverse joins the earlier route's strip
 * rather than taking one of its own.
 */
const pairStrips = (
  routes: readonly LineRoute[],
  lineUri: string,
): StripView[] => {
  const drawn: LineRoute[] = [];
  for (const route of routes) {
    if (!drawn.some((kept) => kept.reverse?.label === route.label)) {
      drawn.push(route);
    }
  }
  return drawn.map((route) => {
    const reverse = routes.find(
      (other) => other !== route && other.label === route.reverse?.label,
    );
    return {
      ...readDirection(route, lineUri),
      route,
      isLoop: route.isLoop,
      reverse:
        reverse === undefined ? undefined : readDirection(reverse, lineUri),
    };
  });
};

/**
 * Read the line query's node into the line page's view: its facts, one
 * strip per route it draws with its reverse, its ends when it is not a loop,
 * and the interchanges it calls at.
 *
 * @param node - The line query's node.
 * @returns The view, or undefined when the node is not a line.
 */
export default function readLineView(node: LineNode): LineView | undefined {
  const { code, colour, routes } = node;
  if (
    node.__typename !== "Line" ||
    code === undefined ||
    colour === undefined ||
    routes === undefined
  ) {
    return undefined;
  }
  const strips = pairStrips(routes, node.uri);
  const first = strips.at(0);
  const isLoop = first?.isLoop ?? false;
  const stops = strips.flatMap((strip) => strip.stops);
  const unique = new Map(stops.map((stop) => [stop.curie, stop]));
  const firstStop = first?.stops.at(0);
  const lastStop = first?.stops.at(-1);
  const ends: readonly [NodeRef, NodeRef] | undefined =
    isLoop || firstStop === undefined || lastStop === undefined
      ? undefined
      : [
          { curie: firstStop.curie, title: firstStop.title },
          { curie: lastStop.curie, title: lastStop.title },
        ];
  return {
    uri: node.uri,
    curie: node._meta.curie,
    title: node._meta.title,
    code,
    colour,
    isLoop,
    strips,
    stopCount: unique.size,
    ends,
    interchanges: (first?.stops ?? [])
      .filter((stop) => stop.isInterchange)
      .map(({ curie, title, transferMinutes }) => ({
        curie,
        title,
        transferMinutes,
      })),
  };
}
