import type { StandardsRoutes } from "../src/lib/types.js";

/**
 * The register the package's own type check and tests run under: the lens's
 * two routes, so every `Link to="standardEntity"` in the lens is checked
 * against the names a site's route table must carry. A site compiles the
 * lens under its own register instead; nothing it compiles imports this
 * module.
 */
declare module "@canonical/router-react" {
  interface RouterRegister {
    routes: StandardsRoutes;
  }
}
