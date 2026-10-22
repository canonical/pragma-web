import { routeLensFacet, routeShortcutFacet } from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { StandardsIcon } from "#lib/LensIcons";
import { StandardReadingPage } from "./StandardReadingPage/index.js";
import { StandardsPage } from "./StandardsPage/index.js";
import warmStandardEntity from "./warmStandardEntity.js";
import warmStandardsIndex from "./warmStandardsIndex.js";

/**
 * The Standards lens routes (P-5): the grouped index (`/standards`, the
 * lens key the Rail links to) and the reading page (`/standards/:uri`,
 * percent-encoded ABSOLUTE IRI, e.g.
 * `/standards/http%3A%2F%2Fpragma.canonical.com%2Fcodestandards%23code.array.safe_access`,
 * the address a `standard` mention's chip lands on). Each data-bearing route's
 * data reaches the store through its `warm` (`warmStandardsIndex`,
 * `warmStandardEntity`), the one seam between the router and the data
 * layer:
 *
 * - on the server, `prepareRelayData` awaits it with a per-request
 *   environment and serialises the store for hydration;
 * - on hover (router-react's `Link`) and on the first browser load it runs
 *   against the browser environment, where it does nothing when the store
 *   already holds the data.
 *
 * The index declares the lens (`routeLensFacet`) and its digit; both
 * routes render inside `StandardsLayout`, whose strip carries the trail
 * and leaves controls and status empty: the cs: surface carries no filter
 * controls (v1) and no governance/status fields to put there.
 */
const routes = {
  standards: route({
    url: "/standards",
    content: StandardsPage,
    warm: warmStandardsIndex,
    meta: {
      ...routeShortcutFacet.of("4"),
      ...routeLensFacet.of({
        label: "Standards",
        icon: StandardsIcon,
        order: 4,
        tier: 1,
      }),
    },
  }),
  standardEntity: route({
    url: "/standards/:uri",
    content: StandardReadingPage,
    warm: warmStandardEntity,
  }),
} as const;

export default routes;
