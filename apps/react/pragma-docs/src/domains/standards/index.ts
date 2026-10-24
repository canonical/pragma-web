/**
 * The Standards domain: the Standards lens ships as a package,
 * `@canonical/prism-lens-standards`; this domain binds the site's rail and
 * colophon to its layout and the site's standards class to its routes. The
 * standards' projections are in `#domains/standards/lib`.
 *
 * @module
 */

export { CODE_STANDARDS_NAMESPACE, STANDARDS_BINDING } from "./constants.js";
export { default as standardsLayout } from "./layout.js";
export { default as standardsRoutes } from "./routes.js";
