/**
 * The class-bound docs view of a Prism documentation site: for each class a
 * site binds, an index of the class's instances, as rows or cards, and a
 * page per instance with its summary, its fields and its relations. A site
 * creates the two routes per binding and groups them under a wrapper of its
 * layout; the routes warm the store through the lens's operations.
 *
 * @module
 */

export { default as createEntityRoutes } from "./createEntityRoutes.js";
export { default as expandAddress } from "./expandAddress.js";
export { default as readUriParam } from "./readUriParam.js";
export type {
  EntityLensOptions,
  EntityRoutes,
  OntologyNamespace,
} from "./types.js";
export type { EntityIndexPageProps } from "./ui/EntityIndexPage/index.js";
export { EntityIndexPage } from "./ui/EntityIndexPage/index.js";
export type { EntityLayoutProps } from "./ui/EntityLayout/index.js";
export { EntityLayout } from "./ui/EntityLayout/index.js";
export type { EntityPageProps } from "./ui/EntityPage/index.js";
export { EntityPage } from "./ui/EntityPage/index.js";
