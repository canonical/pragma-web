import { routeLensFacet, routeShortcutFacet } from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { DefinitionsIcon } from "#lib/LensIcons";
import { DefinitionsPage } from "./DefinitionsPage/index.js";
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
 * The explorer declares the lens (`routeLensFacet`) and its digit; both
 * routes render inside `DefinitionsLayout`, whose strip carries all three
 * sockets (R5 — a toolbar and the top bar should be useful): the trail,
 * the filter chips, and the status figure. The chips filter on the two
 * axes an `OntologyClass` genuinely carries — abstraction and owning
 * ontology. They are NOT a maturity lens: verified live, the ontology
 * surface has no lifecycle, status or channel field, and the `Tag`
 * vocabulary that does carry a channel facet applies to UIBlocks rather
 * than ontology classes.
 */
const routes = {
  definitions: route({
    url: "/definitions",
    content: DefinitionsPage,
    warm: warmDefinitions,
    meta: {
      ...routeShortcutFacet.of("3"),
      ...routeLensFacet.of({
        label: "Definitions",
        icon: DefinitionsIcon,
        order: 3,
        tier: 1,
      }),
    },
  }),
  definitionsTerm: route({
    url: "/definitions/:term",
    content: DefinitionsPage,
    warm: warmDefinitions,
  }),
} as const;

export default routes;
