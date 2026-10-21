import { routeLensFacet, routeShortcutFacet } from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { JourneysIcon } from "#lib/Rail";
import { JourneysPage } from "./JourneysPage/index.js";
import warmJourneys from "./warmJourneys.js";

/**
 * The Journeys lens routes (AV-351): the diagram (`/journeys`, the lens
 * key the Rail links to) and the job view (`/journeys/:job`,
 * percent-encoded graph URI). Both mount the same page over the same ONE
 * operation (`journeysQuery.ts`), and both reach the store through
 * `warm: warmJourneys`, the one seam between the router and the data
 * layer:
 *
 * - on the server, `prepareRelayData` awaits it with a per-request
 *   environment and serialises the store for hydration;
 * - on hover (router-react's `Link`) and on the first browser load it runs
 *   against the browser environment, where it does nothing when the store
 *   already holds the data.
 *
 * THE JOB IS THE ADDRESSABLE THING (P-D7). A journey is a job's path
 * through the surfaces that serve it, so the job is what a reader links
 * to, cites and returns to. The COORDINATE roots the diagram (ruling R1)
 * but is a way of looking, not a place — it lives in the lens's ephemeral
 * filter, never in the URL.
 *
 * The diagram declares the lens (`routeLensFacet`) and its digit; both
 * routes render inside `JourneysLayout`, whose strip carries the `context`
 * AND `controls` sockets (RULING 1). The `controls` socket holds the
 * Table ⇄ Graph view switch — the one instrument that is genuinely a
 * strip-level toolbar: it chooses which reading of the demand model the
 * canvas shows, needs no explanatory caveat, and its labels are
 * data-independent, so the strip content is a stable string. (The lens's OTHER controls — the coordinate chooser and the
 * persona filter — stay in the rail: each needs its own explanatory text
 * (the persona axis is APPROXIMATE and says so), and a strip toolbar is the
 * wrong place for a caveat that must be read.) The `status` socket stays
 * empty — the lens has no single figure worth a live count.
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
