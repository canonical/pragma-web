import { route } from "@canonical/router-core";
import { makeLensContext } from "#lib/LensBreadcrumbs";
import { routeShortcutFacet } from "#lib/routeShortcut";
import { shellStripFacet } from "#lib/Shell";
import { ComponentEntityPage } from "./ComponentEntityPage/index.js";
import { ComponentsCatalogPage } from "./ComponentsCatalogPage/index.js";
import warmCatalog from "./warmCatalog.js";
import warmComponentEntity from "./warmComponentEntity.js";

/**
 * The lens's mode-strip context tenant: the breadcrumb trail. `Components`
 * on the catalog, `Components / <uri>` on an entity page — the entity crumb
 * is the `:uri` route param (the prefixed URI), URL-derived, so the strip
 * reads no query and stays SSR-deterministic.
 */
const ComponentsContext = makeLensContext({
  lensLabel: "Components",
  lensRouteName: "components",
  paramKey: "uri",
});

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
 * Both routes claim the mode strip's context socket ("Components") — the
 * lens name, stationary across the lens's URLs; controls/status stay
 * unclaimed in v1.
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
      ...shellStripFacet.of({ Context: ComponentsContext }),
      ...routeShortcutFacet.of("2"),
    },
  }),
  componentEntity: route({
    url: "/components/:uri",
    content: ComponentEntityPage,
    warm: warmComponentEntity,
    meta: {
      ...shellStripFacet.of({ Context: ComponentsContext }),
    },
  }),
} as const;

export default routes;
