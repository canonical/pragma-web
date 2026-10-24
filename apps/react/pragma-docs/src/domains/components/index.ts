/**
 * The Components domain: the catalog and a component's page, their
 * layout, the lens's rail glyph, and the query contracts and view
 * parameter the routes and their warm steps share. The UI block's
 * projections are in `#domains/components/lib`.
 *
 * @module
 */

export {
  CATALOG_PAGE_SIZE,
  componentsCatalogQueryNode,
  componentsCatalogVariables,
} from "./catalogQuery.js";
export { default as catalogSearch } from "./catalogSearch.js";
export { GLOBAL_TIER } from "./constants.js";
export {
  componentEntityQueryNode,
  componentEntityVariables,
  RELATION_PAGE_SIZE,
} from "./entityQuery.js";
export { default as componentsLayout } from "./layout.js";
export { ComponentEntityPage } from "./lib/ComponentEntityPage/index.js";
export { ComponentsCatalogPage } from "./lib/ComponentsCatalogPage/index.js";
export { ComponentsIcon } from "./lib/ComponentsIcon/index.js";
export { default as componentsRoutes } from "./routes.js";
