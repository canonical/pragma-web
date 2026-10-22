import type {
  DiagramLine,
  DiagramStop,
} from "../src/domains/network/lib/geometry/index.js";
import {
  METRO_NAMESPACE,
  NETWORK_LINES,
  NETWORK_STATIONS,
} from "./fixtures.js";

/**
 * Build the network's lines, in the shape the diagram reads, from the
 * fixture tables: the same lines, routes, calls and positions the metro
 * graph serves.
 *
 * @returns The seven lines, in the order the fixture states them.
 */
export default function buildNetworkLines(): readonly DiagramLine[] {
  const stops = new Map<string, DiagramStop>(
    NETWORK_STATIONS.map(([local, title, x, y, isInterchange]) => [
      local,
      {
        uri: `${METRO_NAMESPACE}${local}`,
        curie: `metro:${local}`,
        title,
        isInterchange,
        position: { x, y },
      },
    ]),
  );
  const findStop = (local: string): DiagramStop => {
    const stop = stops.get(local);
    if (stop === undefined) throw new Error(`no station ${local}`);
    return stop;
  };
  return NETWORK_LINES.map(([local, code, colour, title, routes]) => ({
    uri: `${METRO_NAMESPACE}${local}`,
    curie: `metro:${local}`,
    code,
    colour,
    title,
    routes: routes.map(([label, isLoop, reverseLabel, calls]) => ({
      label,
      isLoop,
      reverseLabel,
      stops: calls.map(findStop),
    })),
  }));
}
