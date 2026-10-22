/**
 * The shapes of the example dataset, and of the provider it is served through.
 *
 * Type-only: no runtime code, which is why the coverage config excludes this
 * file. Everything here describes INERT data — dataset.ts contains records of
 * these shapes and nothing else, no functions. All view construction lives in
 * createExampleProvider.ts, so "a provider is some code and a data file"
 * stays literally true.
 */

import type { GraphQLSchema } from "graphql";

/**
 * Literals keyed by BCP-47 language tag. The empty-string key is the untagged
 * literal — the one a non-RDF provider would simply call "the value".
 */
export type LangMap = Readonly<Record<string, string>>;

/** How a property relates its subject to its object. Mirrors `PropertyKind`. */
export type ExamplePropertyKind = "DATATYPE" | "OBJECT" | "ANNOTATION";

/** A property in the TBox. */
export interface ExampleProperty {
  readonly uri: string;
  readonly labels?: LangMap;
  readonly definitions?: LangMap;
  /** IRI of the class this property applies to, or absent for a global one. */
  readonly domain?: string;
  /** Stringly-typed by the contract: `"String"`, `"Int"`, `"metro:Line"`, … */
  readonly range: string;
  readonly kind: ExamplePropertyKind;
  readonly functional: boolean;
  /** IRI of the property that reads this one backwards, if any. */
  readonly inverse?: string;
}

/** Class-scoped cardinality: a fact about a (class, property) pair. */
export interface ExampleClassProperty {
  /** IRI of the property. */
  readonly property: string;
  readonly required: boolean;
  readonly singular: boolean;
}

/** A class in the TBox. */
export interface ExampleClass {
  readonly uri: string;
  readonly labels?: LangMap;
  readonly definitions?: LangMap;
  readonly comments?: LangMap;
  /** IRI of the direct superclass, if any. */
  readonly superclass?: string;
  readonly isAbstract: boolean;
  /** Cardinality declared ON this class; ancestors' arrive as inherited. */
  readonly properties: readonly ExampleClassProperty[];
}

/** A loaded namespace. */
export interface ExampleOntology {
  readonly prefix: string;
  readonly namespace: string;
  readonly label?: string;
}

/** An embeddable coordinate pair. No IRI — deliberately not an entity. */
export interface ExampleGeoPoint {
  readonly latitude: number;
  readonly longitude: number;
}

/** A point on the schematic network diagram, in whole grid units. */
export interface ExampleDiagramPoint {
  /** Grid columns east of the diagram's west edge. */
  readonly x: number;
  /** Grid rows south of the diagram's north edge. */
  readonly y: number;
}

/**
 * One direction of a line's service. No IRI: a route is a value inside its
 * line, named within that line by `key`.
 */
export interface ExampleRoute {
  /** Names the route within its line, so another route's `reverse` can point at it. */
  readonly key: string;
  /** The route's name as shown to passengers. Required: `Route.label` is non-null. */
  readonly labels: LangMap;
  /** True when the service continues from the last call back to the first. */
  readonly isLoop: boolean;
  /** Stop IRIs in call order. A loop does not repeat its first stop at the end. */
  readonly calls: readonly string[];
  /** `key` of the same line's route over the same stops the other way, if any. */
  readonly reverse?: string;
}

/** What every instance-level record carries, whatever its type. */
export interface ExampleEntityBase {
  readonly uri: string;
  /** IRI of this entity's class. Non-optional: EntityMeta.type is non-null. */
  readonly type: string;
  readonly labels?: LangMap;
  readonly comments?: LangMap;
  readonly definitions?: LangMap;
}

/** A line, a station, an interchange or a fare zone: the network's records. */
export interface ExampleNetworkEntity extends ExampleEntityBase {
  /** GraphQL type name — what `defaultTypeResolver` reads off the view. */
  readonly typename: "Line" | "Station" | "Interchange" | "Zone";
  readonly platformCount?: number;
  readonly transferMinutes?: number;
  readonly location?: ExampleGeoPoint;
  /** IRIs of the lines this station serves. */
  readonly servesLine?: readonly string[];
  /** IRI of the fare zone this station sits in — an entity in the geo namespace. */
  readonly inZone?: string;
  /**
   * The short code passengers know a line by. Required on a Line, because
   * `Line.code` is non-null in the SDL.
   */
  readonly code?: string;
  /**
   * A line's colour, as a lowercase `#rrggbb` hex triplet. Required on a
   * Line, because `Line.colour` is non-null in the SDL.
   */
  readonly colour?: string;
  /** The directions a line runs, each with its ordered calls. */
  readonly routes?: readonly ExampleRoute[];
  /** Where a routed station sits on the schematic network diagram. */
  readonly diagramPosition?: ExampleDiagramPoint;
}

/**
 * How long a vehicle is and how many it carries. Lengths are whole
 * millimetres, measured over couplers so they add up without gaps, and
 * capacity counts passengers seated plus standing.
 */
export interface ExampleMeasures {
  readonly length: number;
  readonly capacity: number;
}

/** A kind of car: its code, whether it has a driving cab, and its measures. */
export interface ExampleCarType extends ExampleEntityBase, ExampleMeasures {
  readonly typename: "CarType";
  /** The short code the car type is known by ("DM", "T"). */
  readonly code: string;
  /** True when the car has a driving cab at its leading end. */
  readonly hasCab: boolean;
}

/** One car in a unit: the car type it is, and which way round it runs. */
export interface ExampleCarPlacement {
  /** IRI of the car type. */
  readonly carType: string;
  /** True when the car's leading end faces the rear of its unit. */
  readonly reversed: boolean;
}

/**
 * A set of cars permanently coupled in order. Its measures are its car
 * types' sums, computed by the provider rather than stored.
 */
export interface ExampleUnit extends ExampleEntityBase {
  readonly typename: "Unit";
  /** The unit's cars, from its front. */
  readonly cars: readonly ExampleCarPlacement[];
}

/**
 * One instance-level record, discriminated by its GraphQL type name so each
 * type's required fields are required by the compiler.
 */
export type ExampleEntity = ExampleNetworkEntity | ExampleCarType | ExampleUnit;

/** The whole dataset: a TBox and an ABox. */
export interface ExampleDataset {
  readonly ontologies: readonly ExampleOntology[];
  readonly classes: readonly ExampleClass[];
  readonly properties: readonly ExampleProperty[];
  readonly entities: readonly ExampleEntity[];
}

/**
 * An executable provider. `rootValue` rather than a resolver map: graphql-js's
 * `defaultFieldResolver` invokes a function-valued property as
 * `source[field](args, context, info)`, and `defaultTypeResolver` reads
 * `__typename`, so plain objects carrying zero-argument arrow functions cover
 * every field this contract declares. There is no resolver map anywhere in
 * this package.
 */
export interface ExampleProvider {
  readonly schema: GraphQLSchema;
  readonly rootValue: Record<string, unknown>;
  /** The exact SDL `schema` was built from — contract first, extension after. */
  readonly sdl: string;
}
