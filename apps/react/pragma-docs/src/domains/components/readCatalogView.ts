import { CATALOG_VIEWS, DEFAULT_CATALOG_VIEW } from "./constants.js";
import type { CatalogView } from "./types.js";

/**
 * Read the catalog's view from the value of its search parameter: one of
 * the two views by name, and the default view for anything else, an absent
 * parameter included, so a mistyped or stale address still shows the
 * catalog.
 *
 * @param value - The parameter's value, or `null` when the address has none.
 * @returns The view the catalog shows.
 */
export default function readCatalogView(value: unknown): CatalogView {
  return CATALOG_VIEWS.find((view) => view === value) ?? DEFAULT_CATALOG_VIEW;
}
