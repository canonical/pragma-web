import { DEFAULT_ENTITY_VIEW, ENTITY_VIEWS } from "./constants.js";
import type { EntityView } from "./types.js";

/**
 * Read the index's view from the value of its search parameter: one of the
 * two views by name, and the default view for anything else, an absent
 * parameter included, so a mistyped or stale address still shows the index.
 *
 * @param value - The parameter's value, or `null` when the address has none.
 * @returns The view the index shows.
 */
export default function readEntityView(value: unknown): EntityView {
  return ENTITY_VIEWS.find((view) => view === value) ?? DEFAULT_ENTITY_VIEW;
}
