import { routeLensFacet, routeShortcutFacet } from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { ComponentsIcon } from "#lib/LensIcons";
import { ComponentEntityPage } from "./ComponentEntityPage/index.js";
import { ComponentsCatalogPage } from "./ComponentsCatalogPage/index.js";
import warmCatalog from "./warmCatalog.js";
import warmComponentEntity from "./warmComponentEntity.js";

/**
 * The Components lens routes (P-5). Each data-bearing route's data reaches
 * the store through its `warm` (`warmCatalog`, `warmComponentEntity`), the
 * one seam between the router and the data layer:
 *
 * - on the server, `prepareRelayData` awaits it with a per-request
 *   environment and serialises the store for hydration;
 * - on hover (router-react's `Link`) and on the first browser load it runs
 *   against the browser environment, where it does nothing when the store
 *   already holds the data (the freshly hydrated page).
 *
 * The catalog declares the lens (`routeLensFacet`) and its digit; both
 * routes render inside `ComponentsLayout`, whose strip carries the trail.
 *
 * Routes declare `component:` — bare page components; the Outlet renders
 * them as real fibers with their own hook lists (AV-340 / PR #880).
 * `content:` is deprecated.
 */
const routes = {
  components: route({
    url: "/components",
    content: ComponentsCatalogPage,
    warm: warmCatalog,
    meta: {
      ...routeShortcutFacet.of("2"),
      ...routeLensFacet.of({
        label: "Components",
        icon: ComponentsIcon,
        order: 2,
        tier: 2,
      }),
    },
  }),
  componentEntity: route({
    url: "/components/:uri",
    content: ComponentEntityPage,
    warm: warmComponentEntity,
  }),
} as const;

export default routes;
