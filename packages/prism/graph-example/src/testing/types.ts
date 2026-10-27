/**
 * Test-only, type-only shapes shared by this package's tests: the
 * reference-extraction and ranking cases; the shapes the test readers
 * return, as a client reads them through GraphQL: `readNetwork`'s lines with
 * their routes and calls and stations with their lines and diagram places,
 * and `readFleet`'s rolling stocks, formations, units and car types with the
 * lines they run; the cars and cabs of a formation in train order, as the
 * fleet tests derive them; and the part of a `_meta` selection the field
 * round-trip reads.
 */

/**
 * One reference-extraction case: a CommonMark document and the IRIs it must
 * yield, in order.
 */
export interface ExtractionCase {
  readonly name: string;
  readonly markdown: string;
  readonly expected: readonly string[];
}

/**
 * One ranking case: search text and the IRIs `rankSearchEntries` must
 * return for it over the search fixtures, best first.
 */
export interface RankingCase {
  readonly name: string;
  readonly text: string;
  readonly expected: readonly string[];
}

/** One class's instances page, the way the readers select it. */
export interface InstancePage<T> {
  readonly instances: {
    readonly edges: readonly { readonly node: T }[];
    readonly pageInfo: { readonly hasNextPage: boolean };
  };
}

/** The part of a `_meta` selection the field round-trip reads. */
export interface PublishedFields {
  readonly fields?: readonly { readonly name: string }[];
  readonly field?: { readonly name: string } | null;
}

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

/** A kind of car, with every field the schema serves on it. */
export interface FleetCarType {
  readonly uri: string;
  readonly name: string | null;
  readonly code: string;
  readonly hasCab: boolean;
  readonly length: number;
  readonly capacity: number;
}

/** One car in a unit, at its place in the order. */
export interface FleetCarPosition {
  readonly position: number;
  readonly reversed: boolean;
  readonly carType: NetworkReference;
}

/** A unit, with its cars and its computed measures. */
export interface FleetUnit {
  readonly uri: string;
  readonly name: string | null;
  readonly length: number;
  readonly capacity: number;
  readonly cars: readonly FleetCarPosition[];
}

/** One unit in a formation, at its place in the order. */
export interface FleetUnitPosition {
  readonly position: number;
  readonly reversed: boolean;
  readonly unit: NetworkReference;
}

/** A formation, with its units, its computed measures, its stock and its lines. */
export interface FleetFormation {
  readonly uri: string;
  readonly name: string | null;
  readonly length: number;
  readonly capacity: number;
  readonly stock: NetworkReference;
  readonly lines: readonly NetworkReference[];
  readonly units: readonly FleetUnitPosition[];
}

/** A rolling stock, with its alternative formations. */
export interface FleetStock {
  readonly uri: string;
  readonly name: string | null;
  readonly formations: readonly NetworkReference[];
}

/** A station or an interchange, with the length of its shortest platform. */
export interface FleetStop {
  readonly uri: string;
  readonly platformLength: number | null;
}

/** One stop on a route, for the platform it offers a train. */
export interface FleetCall {
  readonly stop: FleetStop;
}

/** A line, with the formations it is run with and the stops its routes call at. */
export interface FleetLine {
  readonly uri: string;
  readonly formations: readonly NetworkReference[];
  readonly routes: readonly { readonly calls: readonly FleetCall[] }[];
}

/** One car as it runs in a train: its car type and which way round it is. */
export interface RunningCar {
  readonly carType: FleetCarType;
  /** True when the car's leading end faces the rear of the train. */
  readonly reversed: boolean;
}

/** A driving cab in a train: which car it is in, and which end it faces. */
export interface CabEnd {
  /** The car's place in the train, counted from 1 at the front. */
  readonly car: number;
  readonly faces: "front" | "rear";
}

/**
 * Every rolling stock, formation, unit and car type, every line, and every
 * station with its platform length.
 */
export interface Fleet {
  readonly stocks: readonly FleetStock[];
  readonly formations: readonly FleetFormation[];
  readonly units: readonly FleetUnit[];
  readonly carTypes: readonly FleetCarType[];
  readonly lines: readonly FleetLine[];
  readonly stations: readonly FleetStop[];
}
