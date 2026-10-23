import type {
  DataRouteDefinition,
  StandardSchemaV1,
} from "@canonical/router-core";
import type { ComponentType, ReactElement } from "react";
import type { ENTITY_VIEWS } from "./constants.js";

/** How the index shows a class's instances: a list of rows or a grid of
 * cards. */
export type EntityView = (typeof ENTITY_VIEWS)[number];

/**
 * The reader's ephemeral narrowing of the index, shared by the strip's
 * search box and the canvas. It starts from `DEFAULT_ENTITY_FILTER` and is
 * never seeded from the URL or the browser; the view, which a reader may
 * want to keep, lives in the address instead (`ENTITY_VIEW_PARAM`).
 */
export interface EntityFilter {
  /** The search box's text, as typed. */
  readonly text: string;
}

/** The index route's search values: the view it shows. */
export interface EntityIndexSearch {
  /** The view the address names, or the default view. */
  readonly view: EntityView;
}

/**
 * The index route's search schema: it reads the view from the address's
 * search parameters, whatever they hold.
 */
export type EntityIndexSearchSchema = StandardSchemaV1<
  Readonly<Record<string, unknown>>,
  EntityIndexSearch
>;

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
}

/**
 * The lens's index route: `/${TId}`, the class's instances, in the view its
 * search parameters name.
 */
export type EntityIndexRoute<TId extends string> = DataRouteDefinition<
  `/${TId}`,
  EntityIndexSearchSchema,
  ReactElement
>;

/** The lens's entity route: `/${TId}/:uri`, one instance of the class. */
export type EntityPageRoute<TId extends string> = DataRouteDefinition<
  `/${TId}/:uri`,
  undefined,
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
