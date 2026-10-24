import { route } from "@canonical/router-core";
import { appRoutes } from "../src/routes.js";

/**
 * The site's route table with every page left out: each route keeps its
 * name, its address and its facets, so the rail lists the site's lenses
 * and every link resolves, and renders nothing, so a story of a layout or
 * of the rail mounts no page under itself.
 */
export const SITE_ROUTES = Object.fromEntries(
  Object.entries(appRoutes).map(([name, { url, meta }]) => [
    name,
    route({ url, meta, content: () => null }),
  ]),
);
