import type { NetworkStationQuery$data } from "../../../relay/__generated__/NetworkStationQuery.graphql.js";
import findRouteNeighbours from "./findRouteNeighbours.js";
import type { NodeRef, RouteNeighbourView, StationView } from "./types.js";

type StationNode = NonNullable<NetworkStationQuery$data["node"]>;

/**
 * Read the station query's node into the station page's view: its facts,
 * and, for every route of every line serving it, the stops either side of
 * it. A route that does not call at the station is left out.
 *
 * @param node - The station query's node.
 * @returns The view, or undefined when the node is not a station.
 */
export default function readStationView(
  node: StationNode,
): StationView | undefined {
  const { servesLine } = node;
  if (
    (node.__typename !== "Station" && node.__typename !== "Interchange") ||
    servesLine === undefined
  ) {
    return undefined;
  }
  const routes = servesLine.flatMap((line) =>
    line.routes.flatMap((route): RouteNeighbourView[] => {
      const refs = new Map<string, NodeRef>(
        route.calls.map(({ stop }) => [
          stop.uri,
          { curie: stop._meta.curie, title: stop._meta.title },
        ]),
      );
      const neighbours = findRouteNeighbours(
        route.calls.map(({ stop }) => stop.uri),
        route.isLoop,
        node.uri,
      );
      if (neighbours === undefined) return [];
      return [
        {
          line: {
            curie: line._meta.curie,
            title: line._meta.title,
            code: line.code,
            colour: line.colour,
          },
          label: route.label,
          previous:
            neighbours.previous === undefined
              ? undefined
              : refs.get(neighbours.previous),
          next:
            neighbours.next === undefined
              ? undefined
              : refs.get(neighbours.next),
        },
      ];
    }),
  );
  return {
    curie: node._meta.curie,
    title: node._meta.title,
    kind: node.__typename,
    zone: node.inZone?._meta.title,
    platformCount: node.platformCount ?? undefined,
    transferMinutes: node.transferMinutes ?? undefined,
    routes,
  };
}
