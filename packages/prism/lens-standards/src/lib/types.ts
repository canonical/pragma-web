import type { EntityBinding } from "@canonical/prism-core";
import type { DataRouteDefinition } from "@canonical/router-core";
import type { ReactElement } from "react";

/**
 * What a site binds the Standards lens to: the ontology class whose
 * instances are its standards, as `ontologyClass(uri:)` accepts it (a
 * prefixed address such as `cs:CodeStandard`, or an absolute IRI). A full
 * `EntityBinding` is one too.
 */
export type StandardsBinding = Pick<EntityBinding, "classUri">;

/** The lens's index route: `/standards`, the bound class's instances. */
export type StandardsIndexRoute = DataRouteDefinition<
  "/standards",
  undefined,
  ReactElement
>;

/** The lens's reading route: `/standards/:uri`, one standard. */
export type StandardEntityRoute = DataRouteDefinition<
  "/standards/:uri",
  undefined,
  ReactElement
>;

/**
 * The two routes `createStandardsRoutes` returns, under the names a site's
 * route table keeps them by. A type alias rather than an interface, so a
 * route table typed as a record of routes accepts it.
 */
export type StandardsRoutes = {
  /** The grouped index, which declares the lens. */
  readonly standards: StandardsIndexRoute;
  /** One standard's reading page. */
  readonly standardEntity: StandardEntityRoute;
};
