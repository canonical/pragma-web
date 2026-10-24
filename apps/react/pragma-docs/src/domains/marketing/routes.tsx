import { routeLensFacet, routeShortcutFacet } from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { HomeIcon } from "./lib/HomeIcon/index.js";
import { HomePage } from "./lib/HomePage/index.js";
import warmLobby from "./warmLobby.js";

/**
 * The marketing route: the Home lobby (`/`), the site's front door.
 *
 * The lobby's data reaches the store through `warm: warmLobby`, the one
 * seam between the router and the data layer:
 *
 * - on the server, `prepareRelayData` awaits it with a per-request
 *   environment and serialises the store for hydration;
 * - on hover (router-react's `Link`) and on the first browser load it runs
 *   against the browser environment, where it does nothing when the store
 *   already holds the data.
 *
 * The lobby declares the Home lens (`routeLensFacet`) and its digit, and
 * renders inside `MarketingLayout`.
 */
const routes = {
  home: route({
    url: "/",
    content: () => <HomePage />,
    warm: warmLobby,
    meta: {
      ...routeShortcutFacet.of("1"),
      ...routeLensFacet.of({
        label: "Home",
        icon: HomeIcon,
        order: 1,
        tier: 2,
      }),
    },
  }),
} as const;

export default routes;
