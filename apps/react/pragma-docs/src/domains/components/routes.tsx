import {
  routeLensFacet,
  routeShortcutFacet,
  viewSearch,
} from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { ComponentEntityPage } from "./lib/ComponentEntityPage/index.js";
import { ComponentsCatalogPage } from "./lib/ComponentsCatalogPage/index.js";
import { ComponentsIcon } from "./lib/ComponentsIcon/index.js";
import warmCatalog from "./warmCatalog.js";
import warmComponentEntity from "./warmComponentEntity.js";

/**
 * The Components lens routes. Each data-bearing route's data reaches
 * the store through its `warm` (`warmCatalog`, `warmComponentEntity`), the
 * one seam between the router and the data layer:
 *
 * - on the server, `prepareRelayData` awaits it with a per-request
 *   environment and serialises the store for hydration;
 * - on hover (router-react's `Link`) and on the first browser load it runs
 *   against the browser environment, where it does nothing when the store
 *   already holds the data (the freshly hydrated page).
 *
 * The catalog declares the lens (`routeLensFacet`) and its digit. Both
 * routes declare core's view search, whose renderer (`as`) never reaches
 * their operations, so a warm store serves every renderer; both render
 * inside `ComponentsLayout`, whose strip carries the trail and the
 * renderer switch.
 */
const routes = {
  components: route({
    url: "/components",
    search: viewSearch,
    content: () => <ComponentsCatalogPage />,
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
    search: viewSearch,
    content: ({ params }) => <ComponentEntityPage params={params} />,
    warm: warmComponentEntity,
  }),
} as const;

export default routes;
