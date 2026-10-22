/**
 * The shape `readNetwork` returns: the network as a client reads it through
 * GraphQL, lines with their routes and calls, and every station with the
 * lines it serves. Test-only, and type-only.
 */

/** A reference to a node by its IRI, the way a selection of `{ uri }` answers. */
export interface NetworkReference {
  readonly uri: string;
}

/** One stop on a route, at its place in the order. */
export interface NetworkCall {
  readonly position: number;
  readonly stop: NetworkReference;
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

/** A station or an interchange, with the lines it serves. */
export interface NetworkStation {
  readonly __typename: "Station" | "Interchange";
  readonly uri: string;
  readonly servesLine: readonly NetworkReference[];
}

/** Every line and every station in the network. */
export interface Network {
  readonly lines: readonly NetworkLine[];
  readonly stations: readonly NetworkStation[];
}
