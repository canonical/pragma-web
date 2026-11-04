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
