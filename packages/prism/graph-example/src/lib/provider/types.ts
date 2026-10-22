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

/**
 * An entity's prose: Markdown keyed by language tag. Must hold the default
 * language (`DEFAULT_LANG`), which every request falls back to.
 */
export type ProseTexts = Readonly<Record<string, string>>;

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

/** One instance-level record. */
export interface ExampleEntity {
  readonly uri: string;
  /** IRI of this entity's class. Non-optional: EntityMeta.type is non-null. */
  readonly type: string;
  /** GraphQL type name — what `defaultTypeResolver` reads off the view. */
  readonly typename: "Line" | "Station" | "Interchange" | "Zone";
  readonly labels?: LangMap;
  readonly comments?: LangMap;
  readonly definitions?: LangMap;
  readonly platformCount?: number;
  readonly transferMinutes?: number;
  readonly location?: ExampleGeoPoint;
  /** IRIs of the lines this station serves. */
  readonly servesLine?: readonly string[];
  /** IRI of the fare zone this station sits in — an entity in the geo namespace. */
  readonly inZone?: string;
  /** Long-form Markdown about this entity, served through `Query.prose`. */
  readonly prose?: ProseTexts;
}

/** The whole dataset: a TBox and an ABox. */
export interface ExampleDataset {
  readonly ontologies: readonly ExampleOntology[];
  readonly classes: readonly ExampleClass[];
  readonly properties: readonly ExampleProperty[];
  readonly entities: readonly ExampleEntity[];
}

/**
 * What this provider's resolvers read from the execution context. Every
 * field is optional, and the context itself may be absent: graphql-js passes
 * whatever its caller gave, and a caller may give nothing.
 */
export interface ExampleContext {
  /** The language the request asks prose to be served in. */
  readonly locale?: string;
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

/** One node as search reads it: what text search matches against. */
export interface SearchEntry {
  /** The node's absolute IRI. */
  readonly uri: string;
  /** `_meta.title` in the default language. */
  readonly title: string;
  /** `_meta.curie`. */
  readonly curie: string;
  /** `_meta.definition` in the default language, or null when it has none. */
  readonly definition: string | null;
}

/** How one entry matches a search: which field, and where in it. */
export interface SearchMatch {
  /** The entry's absolute IRI. */
  readonly uri: string;
  /** The field that matched: 0 the title, 1 the CURIE, 2 the definition. */
  readonly tier: number;
  /** Where in that field the text starts, lowercased. */
  readonly position: number;
  /** The entry's title, which breaks ties between equal matches. */
  readonly title: string;
}
