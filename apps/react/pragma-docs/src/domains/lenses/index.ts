// The lens domain's own surface. The Definitions and Standards lenses ship
// as packages, `@canonical/prism-lens-definitions` and
// `@canonical/prism-lens-standards`; this domain binds the site's rail and
// colophon to their layouts and the site's standards class to the Standards
// lens's routes.

export { CODE_STANDARDS_NAMESPACE, STANDARDS_BINDING } from "./constants.js";
export { default as definitionsLayout } from "./definitionsLayout.js";
export { default as LensPlaceholder } from "./LensPlaceholder.js";
export { default as guidesLayout } from "./layout.js";
export { default as lensRoutes } from "./routes.js";
export { default as standardsLayout } from "./standardsLayout.js";
export { default as standardsRoutes } from "./standardsRoutes.js";
