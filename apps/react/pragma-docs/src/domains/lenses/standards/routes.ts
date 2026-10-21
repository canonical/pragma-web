import { route } from "@canonical/router-core";
import { makeLensContext } from "#lib/LensBreadcrumbs";
import { StandardsIcon } from "#lib/Rail";
import { routeLensFacet } from "#lib/routeLens";
import { routeShortcutFacet } from "#lib/routeShortcut";
import { shellStripFacet } from "#lib/Shell";
import { StandardReadingPage } from "./StandardReadingPage/index.js";
import { StandardsPage } from "./StandardsPage/index.js";
import warmStandardEntity from "./warmStandardEntity.js";
import warmStandardsIndex from "./warmStandardsIndex.js";

/**
 * The lens's mode-strip context tenant: the breadcrumb trail. `Standards`
 * on the index, `Standards / <uri>` on a reading page — the reading crumb
 * is the `:uri` route param (now the entity's ABSOLUTE IRI, which is the
 * only thing `node(id:)` accepts), URL-derived, so the strip reads no
 * query.
 */
const StandardsContext = makeLensContext({
  lensLabel: "Standards",
  lensRouteName: "standards",
  paramKey: "uri",
});

/**
 * The Standards lens routes (P-5): the grouped index (`/standards`, the
 * lens key the Rail links to) and the reading page (`/standards/:uri`,
 * percent-encoded ABSOLUTE IRI, e.g.
 * `/standards/http%3A%2F%2Fpragma.canonical.com%2Fcodestandards%23code.array.safe_access`
 * — the D31 address `resolveChipHref` derives for `standard` mentions,
 * pinned round-trip in `src/routes.tests.ts`). Each data-bearing route's
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
 * Both routes claim the mode strip's context socket ("Standards") — the
 * lens name, stationary across the lens's URLs. Controls/status stay
 * UNCLAIMED — honestly empty: the cs: surface carries no filter controls
 * (v1) and no governance/status fields to put there.
 */
const routes = {
  standards: route({
    url: "/standards",
    content: StandardsPage,
    warm: warmStandardsIndex,
    meta: {
      ...shellStripFacet.of({ Context: StandardsContext }),
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
    meta: {
      ...shellStripFacet.of({ Context: StandardsContext }),
    },
  }),
} as const;

export default routes;
