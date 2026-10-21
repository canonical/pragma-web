import { routeLensFacet, routeShortcutFacet } from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { HomeIcon } from "#lib/LensIcons";
import GuidePage from "./GuidePage.js";
import HomePage from "./HomePage.js";
import warmLobby from "./warmLobby.js";

/**
 * The marketing routes: the Home lobby (`/`, AV-350 — the front door, and
 * the last route to come over the graph) and the guide reading detail
 * (`/guides/:slug`, which stays a plain authored page — it has no graph
 * query yet).
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
 * renders inside `MarketingLayout`. The guide page renders inside the
 * Guides lens's layout instead, beside the guides index it belongs to.
 */
const routes = {
  home: route({
    url: "/",
    content: HomePage,
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
  guide: route({
    url: "/guides/:slug",
    content: GuidePage,
  }),
} as const;

export default routes;
