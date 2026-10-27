/** A place on the schematic grid, in whole grid units: `x` east, `y` south. */
export interface GridPoint {
  readonly x: number;
  readonly y: number;
}

/** A place in the drawing, in SVG user units of the map's viewBox. */
export interface DrawingPoint {
  readonly x: number;
  readonly y: number;
}

/** A stop as the diagram draws it: its address, its name and its place. */
export interface DiagramStop {
  /** The stop's IRI, the key every segment and mark is built on. */
  readonly uri: string;
  /** The stop's compact address, which its home is built from. */
  readonly curie: string;
  /** The stop's name, as the graph titles it. */
  readonly title: string;
  /** Whether the graph serves the stop as an interchange. */
  readonly isInterchange: boolean;
  /** The stop's place on the schematic grid. */
  readonly position: GridPoint;
}

/** One direction of a line's service, its stops in the order it calls. */
export interface DiagramRoute {
  /** The route's name as passengers read it, unique within its line. */
  readonly label: string;
  /** Whether the service continues from the last stop back to the first. */
  readonly isLoop: boolean;
  /** The stops, in calling order; the first is never repeated at the end. */
  readonly stops: readonly DiagramStop[];
  /** The label of the same line's route the other way, or null. */
  readonly reverseLabel: string | null;
}

/** A line and the routes it runs. */
export interface DiagramLine {
  /** The line's IRI. */
  readonly uri: string;
  /** The line's compact address. */
  readonly curie: string;
  /** The short code passengers know the line by, which orders shared tracks. */
  readonly code: string;
  /** The line's colour, a `#rrggbb` triplet from the graph. */
  readonly colour: string;
  /** The line's name. */
  readonly title: string;
  /** The line's routes. */
  readonly routes: readonly DiagramRoute[];
}

/**
 * The stretch of track between two consecutive stops of a route. Its key and
 * canonical direction are the same whichever way the route runs over it.
 */
export interface Segment {
  /** The stop the route leaves. */
  readonly start: DiagramStop;
  /** The stop the route reaches. */
  readonly end: DiagramStop;
  /** The stop the segment's canonical direction starts from. */
  readonly from: DiagramStop;
  /** The stop the segment's canonical direction ends at. */
  readonly to: DiagramStop;
  /** The key both directions share: the two stop IRIs in sorted order. */
  readonly key: string;
}

/** One line's drawn track: the route drawn for it, as SVG path data. */
export interface Track {
  readonly lineUri: string;
  readonly lineTitle: string;
  readonly colour: string;
  /** The route the track follows, its reverse being the same track. */
  readonly routeLabel: string;
  /** The path's `d` attribute. */
  readonly path: string;
}

/** A straight piece of a drawn track, between two of its vertices. */
export type TrackSegment = readonly [DrawingPoint, DrawingPoint];

/** An axis-aligned box in the drawing. */
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Where a station's name sits: its anchor point, which way the text runs
 * from it, and the box the text is estimated to fill.
 */
export interface LabelPlacement extends DrawingPoint {
  readonly anchor: "start" | "middle" | "end";
  readonly box: Box;
}

/**
 * A station's mark before its label is placed: a dot where one track
 * passes, a capsule where several pass side by side or lines meet, as a box
 * with the corner radius that rounds it.
 */
export interface MarkBox extends Box {
  readonly stop: DiagramStop;
  readonly shape: "dot" | "capsule";
  readonly radius: number;
}

/** A station's mark with its label placed. */
export interface StationMark extends MarkBox {
  readonly label: LabelPlacement;
}

/** A route offset onto its own track. */
export interface OffsetRoute {
  /** The drawn path's vertices, bends included, in calling order. */
  readonly points: readonly DrawingPoint[];
  /** Whether the track closes on itself, as a loop does. */
  readonly closed: boolean;
  /** Where the track passes each stop, by stop IRI. */
  readonly stops: ReadonlyMap<string, DrawingPoint>;
  /** The unit directions the track leaves each stop in, by stop IRI. */
  readonly directions: ReadonlyMap<string, readonly DrawingPoint[]>;
}

/** Everything the schematic map draws, in SVG user units. */
export interface NetworkGeometry {
  /** The box around everything the drawing holds, with its margin. */
  readonly viewBox: Box;
  readonly tracks: readonly Track[];
  readonly marks: readonly StationMark[];
}
