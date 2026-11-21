import type {
  FilterPlacement,
  LensRenderers,
  ViewSearchSchema,
} from "@canonical/prism-core";
import type { DataRouteDefinition } from "@canonical/router-core";
import type { ComponentType, ReactElement } from "react";

/** One ontology's addressing identity, as the graph states it. */
export interface OntologyNamespace {
  /** The compact prefix, e.g. `metro`. */
  readonly prefix: string;
  /** The full namespace IRI, e.g. `https://metro.example/onto#`. */
  readonly namespace: string;
}

/** What a site says about one entity lens when it creates its routes. */
export interface EntityLensOptions {
  /**
   * The lens's name, in the site's own words: the rail entry, the trail's
   * first crumb, the index's heading and its document title.
   */
  readonly label: string;
  /** The lens's place in the rail, ascending; unique across the site. */
  readonly order: number;
  /** The rail glyph; the lens's own `EntityIcon` when omitted. */
  readonly icon?: ComponentType;
  /**
   * The renderers the lens's index and entity pages offer, by name over the
   * site's defaults or as its own; the site's defaults when omitted.
   */
  readonly renderers?: LensRenderers;
  /** Where the index places its filters; the bar when omitted. */
  readonly filters?: FilterPlacement;
}

/**
 * The lens's index route: `/${TId}`, the class's instances, in the renderer
 * and narrowed by the search its address names.
 */
export type EntityIndexRoute<TId extends string> = DataRouteDefinition<
  `/${TId}`,
  ViewSearchSchema,
  ReactElement
>;

/**
 * The lens's entity route: `/${TId}/:uri`, one instance of the class, in
 * the renderer its address names.
 */
export type EntityPageRoute<TId extends string> = DataRouteDefinition<
  `/${TId}/:uri`,
  ViewSearchSchema,
  ReactElement
>;

/**
 * The two routes `createEntityRoutes` returns for a binding with id `TId`,
 * under the names a site's route table keeps them by: the index as `TId`,
 * and the entity page as `${TId}Entity` (`ENTITY_ROUTE_SUFFIX`).
 */
export type EntityRoutes<TId extends string> = {
  readonly [K in TId]: EntityIndexRoute<TId>;
} & {
  readonly [K in `${TId}Entity`]: EntityPageRoute<TId>;
};

/**
 * How many values a field takes on its class: exactly one, at most one, one
 * or more, or any number.
 */
export type Cardinality = "one" | "optional" | "many" | "any";

/**
 * What a statement group's label is read from: its predicate's labels in
 * the site's language, each absent when the ontology states none, its
 * predicate's IRI and its true count.
 */
export interface StatementGroupLabels {
  readonly predicateUri: string;
  readonly total: number;
  readonly predicate:
    | {
        readonly label?: string | null;
        readonly pluralLabel?: string | null;
        readonly inverseLabel?: string | null;
        readonly inversePluralLabel?: string | null;
      }
    | null
    | undefined;
}

/** What an entity's one-line description is read from. */
export interface EntityDescription {
  readonly definition: string | null | undefined;
  readonly comment: string | null | undefined;
}

/** A field of the entity's class as the statements' partition reads it. */
export interface PartitionField {
  readonly name: string;
  readonly order?: number | null;
  readonly visibility?: string | null;
  readonly group?: {
    readonly uri: string;
    readonly label?: string | null;
    readonly order?: number | null;
  } | null;
  readonly property: { readonly uri: string };
}

/** What the statements' partition reads of the entity: its summary's source and its class's fields. */
export interface PartitionMeta {
  readonly definition: string | null | undefined;
  readonly fields: readonly PartitionField[];
}

/** What the partition reads of a group: its predicate and, of each node it holds, the node's class's visibility. */
export interface PartitionGroup {
  readonly predicateUri: string;
  readonly values: readonly {
    readonly __typename: string;
    readonly node?: {
      readonly _meta: {
        readonly type: { readonly visibility?: string | null };
      };
    };
  }[];
}

/** A group the partition kept, beside the lens's field for its predicate when the lens has one. */
export interface PartitionedGroup<G> {
  readonly group: G;
  readonly field: PartitionField | undefined;
}

/**
 * An entity's outgoing statement groups, split as the page and the panel
 * show them: the prominent groups, the groups of values (literals, nested
 * values, nodes of hidden classes) and the relations (nodes of a shown
 * class), the header's and the summary's predicates left out.
 */
export interface StatementPartition<G> {
  readonly prominent: readonly G[];
  readonly values: readonly PartitionedGroup<G>[];
  readonly relations: readonly PartitionedGroup<G>[];
}
