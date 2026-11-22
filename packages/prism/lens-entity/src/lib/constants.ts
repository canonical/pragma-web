/**
 * The entity lens's domain constants: the names it derives from a binding,
 * the page size it asks the graph for, and the length past which the
 * details panel closes a text.
 */

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

/**
 * The longest text the details panel shows open, in characters: a literal
 * longer than this, or one over several lines, is drawn as a closed group.
 */
export const PANEL_TEXT_LIMIT = 120;
