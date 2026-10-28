import type { NetworkMapQuery$data } from "#relay/__generated__/NetworkMapQuery.graphql.js";
import type { NetworkIndex } from "./types.js";

type LineNode = NonNullable<
  NetworkMapQuery$data["ontologyClass"]
>["instances"]["edges"][number]["node"];

/**
 * Read the inspector's lists from the map query: the network's lines in
 * code order, and every stop a route calls at, once each, in name order,
 * each as the key its list projects.
 *
 * @param data - The map query's data.
 * @returns The lines' and the stations' keys.
 */
export default function readNetworkIndex(
  data: NetworkMapQuery$data,
): NetworkIndex {
  const lines = (data.ontologyClass?.instances.edges ?? [])
    .map(({ node }) => node)
    .filter(
      (
        node,
      ): node is LineNode & {
        readonly code: string;
        readonly routes: NonNullable<LineNode["routes"]>;
      } => typeof node.code === "string" && node.routes !== undefined,
    )
    .sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true }));
  const stops = new Map(
    lines.flatMap((line) =>
      line.routes.flatMap((route) =>
        route.calls.map(({ stop }) => [stop.uri, stop] as const),
      ),
    ),
  );
  const stations = [...stops.values()].sort((a, b) =>
    a._meta.title.localeCompare(b._meta.title, "en"),
  );
  return { lines, stations };
}
