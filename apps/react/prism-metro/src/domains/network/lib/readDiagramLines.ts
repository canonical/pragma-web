import type { NetworkMapQuery$data } from "../../../relay/__generated__/NetworkMapQuery.graphql.js";
import type {
  DiagramLine,
  DiagramRoute,
  DiagramStop,
} from "./geometry/index.js";

type MapRoute = NonNullable<
  NetworkMapQuery$data["ontologyClass"]
>["instances"]["edges"][number]["node"]["routes"];

/** Read one call's stop as the diagram draws it, or null when it has no place on the diagram. */
const readStop = ({
  stop,
}: NonNullable<MapRoute>[number]["calls"][number]): DiagramStop | null =>
  stop.diagramPosition
    ? {
        uri: stop.uri,
        curie: stop._meta.curie,
        title: stop._meta.title,
        isInterchange: stop.__typename === "Interchange",
        position: { x: stop.diagramPosition.x, y: stop.diagramPosition.y },
      }
    : null;

/** Read one route, its calls in position order, as the diagram draws it. */
const readRoute = (route: NonNullable<MapRoute>[number]): DiagramRoute => ({
  label: route.label,
  isLoop: route.isLoop,
  reverseLabel: route.reverse?.label ?? null,
  stops: [...route.calls]
    .sort((a, b) => a.position - b.position)
    .map(readStop)
    .filter((stop): stop is DiagramStop => stop !== null),
});

/**
 * Read the map query's lines into the shape the diagram draws from. The
 * graph is an external boundary, so nothing it may leave out is trusted to
 * be there: an instance that is not a line is skipped, a stop with no
 * diagram position is left off its route, and a route left with fewer than
 * two stops is not drawn.
 *
 * @param data - The map query's response.
 * @returns The network's lines, in the graph's order.
 */
export default function readDiagramLines(
  data: NetworkMapQuery$data,
): readonly DiagramLine[] {
  const edges = data.ontologyClass?.instances.edges ?? [];
  return edges.flatMap(({ node }) =>
    node.code === undefined ||
    node.colour === undefined ||
    node.routes === undefined
      ? []
      : [
          {
            uri: node.uri,
            curie: node._meta.curie,
            code: node.code,
            colour: node.colour,
            title: node._meta.title,
            routes: node.routes
              .map(readRoute)
              .filter((route) => route.stops.length >= 2),
          },
        ],
  );
}
