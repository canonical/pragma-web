/** A stop or a line as a link names it: its compact address and its title. */
export interface NodeRef {
  readonly curie: string;
  readonly title: string;
}

/** A line as a stop's other connections show it. */
export interface LineRef extends NodeRef {
  readonly code: string;
  readonly colour: string;
}

/** Where a station sits on one route: the stops either side of it. */
export interface RouteNeighbourView {
  readonly line: LineRef;
  /** The route's label ("To Marsh End", "Clockwise"). */
  readonly label: string;
  /** The stop before, absent at a linear route's first stop. */
  readonly previous?: NodeRef;
  /** The stop after, absent at a linear route's last stop. */
  readonly next?: NodeRef;
}

/** A station as its page shows it. */
export interface StationView extends NodeRef {
  readonly kind: "Station" | "Interchange";
  readonly zone?: string;
  readonly platformCount?: number;
  /** Minutes a transfer takes, at an interchange. */
  readonly transferMinutes?: number;
  /** Every route of every line serving the station, line by line. */
  readonly routes: readonly RouteNeighbourView[];
}

/** One stop of a line strip. */
export interface StripStop extends NodeRef {
  readonly isInterchange: boolean;
  /** Minutes a transfer takes, at an interchange. */
  readonly transferMinutes?: number;
  /** The other lines serving the stop. */
  readonly connections: readonly LineRef[];
}

/** One direction of a line strip: its label and its stops in calling order. */
export interface StripDirection {
  readonly label: string;
  readonly stops: readonly StripStop[];
}

/** A route as its strip shows it, with its reverse when the line runs both ways. */
export interface StripView extends StripDirection {
  readonly isLoop: boolean;
  readonly reverse?: StripDirection;
}

/** A line as its page shows it. */
export interface LineView extends LineRef {
  /** Whether the line's service runs a loop. */
  readonly isLoop: boolean;
  /** One strip per route the line draws, each with its reverse. */
  readonly strips: readonly StripView[];
  /** How many stops the line calls at. */
  readonly stopCount: number;
  /** The first route's first and last stops, on a line that is not a loop. */
  readonly ends?: readonly [NodeRef, NodeRef];
  /** The interchanges the line calls at, in the first route's order. */
  readonly interchanges: readonly (NodeRef & {
    readonly transferMinutes?: number;
  })[];
}
