import { routeLensFacet, routeShortcutFacet } from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { JourneysIcon } from "./lib/JourneysIcon/index.js";
import { JourneysPage } from "./lib/JourneysPage/index.js";
import warmJourneys from "./warmJourneys.js";

/**
 * The Journeys lens routes: the lens index (`/journeys`, the key the rail
 * links to) and a job (`/journeys/:job`, its percent-encoded graph URI).
 * Both mount the same page over the same operation (`journeysQuery.ts`),
 * and both reach the store through `warm: warmJourneys`, the one seam
 * between the router and the data layer: on the server `prepareRelayData`
 * awaits it and serialises the store for hydration; on hover and on the
 * first browser load it does nothing when the store already holds the
 * data.
 *
 * The job is the addressable thing: a journey is a job's path through the
 * surfaces that serve it, so the job is what a reader links to, cites and
 * returns to. The coordinate the graph roots at is a way of looking, kept
 * in the explorer's filter and never in the URL.
 *
 * The index declares the lens (`routeLensFacet`) and its digit; both
 * routes render inside `JourneysLayout`, whose strip carries the trail and
 * the table and graph switch.
 */
const routes = {
  journeys: route({
    url: "/journeys",
    content: JourneysPage,
    warm: warmJourneys,
    meta: {
      ...routeShortcutFacet.of("5"),
      ...routeLensFacet.of({
        label: "Journeys",
        icon: JourneysIcon,
        order: 5,
        tier: 2,
      }),
    },
  }),
  journeysJob: route({
    url: "/journeys/:job",
    content: JourneysPage,
    warm: warmJourneys,
  }),
} as const;

export default routes;
