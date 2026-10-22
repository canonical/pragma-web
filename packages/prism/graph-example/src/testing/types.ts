/**
 * The shape `readNetwork` returns: the network as a client reads it through
 * GraphQL, lines with their routes and calls, and every station with the
 * lines it serves and its place on the schematic diagram. Test-only, and
 * type-only.
 */

/** A reference to a node by its IRI, the way a selection of `{ uri }` answers. */
export interface NetworkReference {
  readonly uri: string;
}

/** A place on the schematic network diagram, in grid units. */
export interface NetworkPoint {
  readonly x: number;
  readonly y: number;
}

/** One stop on a route, at its place in the order, with its place on the diagram. */
export interface NetworkCall {
  readonly position: number;
  readonly stop: NetworkReference & {
    readonly diagramPosition: NetworkPoint | null;
  };
}

/** One direction of a line's service. */
export interface NetworkRoute {
  readonly label: string;
  readonly isLoop: boolean;
  readonly reverse: { readonly label: string } | null;
  readonly calls: readonly NetworkCall[];
}

/** A line, with the stops that serve it and the routes it runs. */
export interface NetworkLine {
  readonly uri: string;
  readonly code: string;
  readonly colour: string;
  readonly servedBy: readonly NetworkReference[];
  readonly routes: readonly NetworkRoute[];
}

/** A station or an interchange, with the lines it serves and its place on the diagram. */
export interface NetworkStation {
  readonly __typename: "Station" | "Interchange";
  readonly uri: string;
  readonly servesLine: readonly NetworkReference[];
  readonly diagramPosition: NetworkPoint | null;
}

/** Every line and every station in the network. */
export interface Network {
  readonly lines: readonly NetworkLine[];
  readonly stations: readonly NetworkStation[];
}
