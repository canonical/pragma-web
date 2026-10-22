/** The stops either side of one stop on a route, by IRI. */
export interface RouteNeighbours {
  /** The stop the route calls at before it, absent at an open start. */
  readonly previous?: string;
  /** The stop the route calls at after it, absent at an open end. */
  readonly next?: string;
}

/**
 * Find the stops either side of a stop on a route: the call before it and
 * the call after it. A loop wraps, so its first stop follows its last; a
 * linear route has nothing before its first stop or after its last.
 *
 * @param stops - The route's stop IRIs, in calling order.
 * @param isLoop - Whether the route continues from its last stop to its first.
 * @param uri - The stop to look around.
 * @returns The neighbours, or undefined when the route does not call at `uri`.
 */
export default function findRouteNeighbours(
  stops: readonly string[],
  isLoop: boolean,
  uri: string,
): RouteNeighbours | undefined {
  const index = stops.indexOf(uri);
  if (index === -1) return undefined;
  const last = stops.length - 1;
  const wraps = isLoop && stops.length > 1;
  return {
    previous:
      index > 0 ? stops.at(index - 1) : wraps ? stops.at(last) : undefined,
    next: index < last ? stops.at(index + 1) : wraps ? stops.at(0) : undefined,
  };
}
