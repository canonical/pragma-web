/**
 * The entity lens's domain constants: the names it derives from a binding,
 * the page size it asks the graph for, the index's views and the search
 * parameter that keeps one, the filter's no-op default, and the catalog
 * keys that name a field's cardinality.
 */

import type { MessageKey } from "./i18n/index.js";
import type { Cardinality, EntityFilter, EntityView } from "./types.js";

/**
 * The suffix the entity route's name adds to the binding's id: the binding
 * `stations` names its index route `stations` and its entity route
 * `stationsEntity`.
 */
export const ENTITY_ROUTE_SUFFIX = "Entity";

/** The entity route's one param: the entity's address, `/stations/:uri`. */
export const ENTITY_URI_PARAM = "uri";

/**
 * One page of a class's instances. 100 is a size this lens chooses, not a
 * contract fact: ke-graphql clamps at 100 and silently truncates a larger
 * ask, while the metro provider does not clamp at all. 100 is therefore safe
 * on both, and the index pairs it with an explicit "Load more" rather than
 * an invisible truncation.
 */
export const ENTITY_PAGE_SIZE = 100;

/** The two ways the index shows a class's instances. */
export const ENTITY_VIEWS = ["rows", "cards"] as const;

/**
 * The search parameter the index keeps its view in, so a view survives a
 * reload and travels with a shared link: `/stations?view=cards`.
 */
export const ENTITY_VIEW_PARAM = "view";

/**
 * The view the index shows when the address names none, or names one it
 * does not know. The address carries the parameter only for any other view.
 */
export const DEFAULT_ENTITY_VIEW: EntityView = "rows";

/**
 * The no-op default, and the only value the filter may start from: no
 * search text, so every loaded entry shows. The server render and the
 * client's first paint therefore agree byte for byte.
 */
export const DEFAULT_ENTITY_FILTER: EntityFilter = {
  text: "",
};

/** The catalog key that names each cardinality, in the fields table and the
 * relations. */
export const CARDINALITY_MESSAGES: Readonly<Record<Cardinality, MessageKey>> = {
  one: "cardinality.one",
  optional: "cardinality.optional",
  many: "cardinality.many",
  any: "cardinality.any",
};
