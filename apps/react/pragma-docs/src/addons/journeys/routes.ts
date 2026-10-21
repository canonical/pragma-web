import { route } from "@canonical/router-core";
import { routeShortcutFacet } from "#lib/routeShortcut";
import { shellStripFacet } from "#lib/Shell";
import { JourneysPage } from "./JourneysPage/index.js";
import { journeysStripSlots } from "./stripSlots.js";
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
 * Both routes claim the strip's `context` AND `controls` sockets (RULING
 * 1). The `controls` socket now holds the Table ⇄ Graph view switch — the
 * one instrument that is genuinely a strip-level toolbar: it chooses which
 * reading of the demand model the canvas shows, needs no explanatory caveat,
 * and its labels are data-independent, so the strip content is a stable
 * string. (The lens's OTHER controls — the coordinate chooser and the
 * persona filter — stay in the rail: each needs its own explanatory text
 * (the persona axis is APPROXIMATE and says so), and a strip toolbar is the
 * wrong place for a caveat that must be read.) The `status` socket stays
 * unclaimed — the lens has no single figure worth a live count.
 *
 * Claiming the `controls` socket deliberately loosened
 * `frameStability.tests.tsx`, which previously asserted the journeys
 * `controls` slot was empty; that change landed in its own commit with its
 * own justification, the same way the Definitions claim did.
 */
const routes = {
  journeys: route({
    url: "/journeys",
    content: JourneysPage,
    warm: warmJourneys,
    meta: {
      ...shellStripFacet.of({ ...journeysStripSlots }),
      ...routeShortcutFacet.of("5"),
    },
  }),
  journeysJob: route({
    url: "/journeys/:job",
    content: JourneysPage,
    warm: warmJourneys,
    meta: {
      ...shellStripFacet.of({ ...journeysStripSlots }),
    },
  }),
} as const;

export default routes;
