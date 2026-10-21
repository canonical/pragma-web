import type { SITE_ROUTES } from "./fixtures.js";

/**
 * The register the package's own type check and tests run under: the route
 * table of a site that mounts the lens twice, over the metro graph's
 * stations and lines, so every name the lens builds a link or a path from
 * (`stations`, `stationsEntity`, …) is checked against the names such a
 * table carries. A site compiles the lens under its own register instead;
 * nothing it compiles imports this module.
 */
declare module "@canonical/router-react" {
  interface RouterRegister {
    routes: typeof SITE_ROUTES;
  }
}
