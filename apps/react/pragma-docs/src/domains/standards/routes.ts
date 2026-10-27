import { createStandardsRoutes } from "@canonical/prism-lens-standards";
import { STANDARDS_BINDING } from "./constants.js";

/** The Standards lens's two routes, bound to the site's standards class:
 * the one instance the route table, the stories and the tests share. */
export default createStandardsRoutes(STANDARDS_BINDING);
