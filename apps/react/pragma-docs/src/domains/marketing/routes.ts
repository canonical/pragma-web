import { route } from "@canonical/router-core";
import { makeLensContext } from "#lib/LensBreadcrumbs";
import { HomeIcon } from "#lib/Rail";
import { routeLensFacet } from "#lib/routeLens";
import { routeShortcutFacet } from "#lib/routeShortcut";
import { shellStripFacet } from "#lib/Shell";
import GuidePage from "./GuidePage.js";
import HomePage from "./HomePage.js";
import warmLobby from "./warmLobby.js";

/**
 * The lobby's mode-strip context tenant: a single `Home` crumb (the lens
 * name as the Rail's `LENS_ENTRIES` labels it). The lobby has one address,
 * so there is no terminal crumb and no route param to read — the lens crumb
 * IS the current page.
 */
const HomeContext = makeLensContext({
  lensLabel: "Home",
  lensRouteName: "home",
});

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
 * The lobby claims the mode strip's context socket with "Home" — the lens
 * name as the Rail's `LENS_ENTRIES` labels it, matching how every other
 * lens claims its own name. Controls/status stay UNCLAIMED — honestly
 * empty: the lobby has no filters and no status to report.
 */
const routes = {
  home: route({
    url: "/",
    content: HomePage,
    warm: warmLobby,
    meta: {
      ...shellStripFacet.of({ Context: HomeContext }),
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
