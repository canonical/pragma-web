/**
 * The Standards lens of a Prism documentation site: a grouped index of the
 * instances of the class a site binds it to, and a reading page for each. A
 * site creates the lens's two routes from its binding, mounts them under a
 * wrapper of the lens's layout, and the routes warm the store through the
 * lens's operations.
 *
 * @module
 */

export { default as createStandardsRoutes } from "./createStandardsRoutes.js";
export type { StandardsBinding } from "./types.js";
export type { StandardsLayoutProps } from "./ui/StandardsLayout/index.js";
export { StandardsLayout } from "./ui/StandardsLayout/index.js";
