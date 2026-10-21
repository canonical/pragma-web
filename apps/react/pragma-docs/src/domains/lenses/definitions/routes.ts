import { route } from "@canonical/router-core";
import { routeShortcutFacet } from "#lib/routeShortcut";
import { shellStripFacet } from "#lib/Shell";
import { DefinitionsPage } from "./DefinitionsPage/index.js";
import { definitionsStripSlots } from "./stripSlots.js";
import warmDefinitions from "./warmDefinitions.js";

/**
 * The Definitions lens routes (P-5): the explorer (`/definitions`, the
 * lens key the Rail links to) and the term view (`/definitions/:term`,
 * percent-encoded prefixed URI, e.g. `/definitions/ds%3AUIBlock`). Both
 * mount the same page over the same ONE operation (`definitionsQuery.ts`),
 * and both reach the store through `warm: warmDefinitions`, the one seam
 * between the router and the data layer:
 *
 * - on the server, `prepareRelayData` awaits it with a per-request
 *   environment and serialises the store for hydration;
 * - on hover (router-react's `Link`) and on the first browser load it runs
 *   against the browser environment, where it does nothing when the store
 *   already holds the data.
 *
 * Both routes claim ALL THREE mode-strip sockets (R5 — a toolbar and the
 * top bar should be useful): the context name, the filter chips, and the
 * status figure. The chips filter on the two axes an `OntologyClass`
 * genuinely carries — abstraction and owning ontology. They are NOT a
 * maturity lens: verified live, the ontology surface has no lifecycle,
 * status or channel field, and the `Tag` vocabulary that does carry a
 * channel facet applies to UIBlocks rather than ontology classes.
 *
 * Claiming the sockets deliberately loosened `frameStability.tests.tsx`,
 * which previously asserted both were empty on every URL; that change
 * landed in its own commit with its own justification.
 */
const routes = {
  definitions: route({
    url: "/definitions",
    content: DefinitionsPage,
    warm: warmDefinitions,
    meta: {
      ...shellStripFacet.of({ ...definitionsStripSlots }),
      ...routeShortcutFacet.of("3"),
    },
  }),
  definitionsTerm: route({
    url: "/definitions/:term",
    content: DefinitionsPage,
    warm: warmDefinitions,
    meta: {
      ...shellStripFacet.of({ ...definitionsStripSlots }),
    },
  }),
} as const;

export default routes;
