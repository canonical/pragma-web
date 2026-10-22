import type { DiagramLine } from "./geometry/index.js";

/** The kinds of node a network route addresses. */
export type NetworkNodeKind = "line" | "stop";

/**
 * Resolve a network route's address to the IRI the graph answers `node(id:)`
 * with, by finding it among the network's own lines or the stops their
 * routes call at, whether the address is compact (the form the site's homes
 * build links from) or already the IRI. The network lens shows only what the
 * network routes, so anything else is not found here.
 *
 * @param address - The route's address, percent-decoded.
 * @param lines - The network's lines, as the map query reads them.
 * @param kind - Whether the address names a line or a stop.
 * @returns The node's IRI, or undefined when the network has no such node.
 */
export default function resolveNetworkAddress(
  address: string,
  lines: readonly DiagramLine[],
  kind: NetworkNodeKind,
): string | undefined {
  const candidates =
    kind === "line"
      ? lines
      : lines.flatMap((line) => line.routes.flatMap((route) => route.stops));
  return candidates.find(
    (candidate) => candidate.curie === address || candidate.uri === address,
  )?.uri;
}
