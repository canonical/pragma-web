// The lens domain's own surface. `standards/` is a sibling sub-domain with its
// own barrel; it is not re-exported here, because a barrel that flattened it
// would hide which domain owns a given lens. The Definitions lens ships as a
// package, `@canonical/prism-lens-definitions`; this domain binds the site's
// rail and colophon to its layout.

export { default as definitionsLayout } from "./definitionsLayout.js";
export { default as LensPlaceholder } from "./LensPlaceholder.js";
export { default as guidesLayout } from "./layout.js";
export { default as lensRoutes } from "./routes.js";
