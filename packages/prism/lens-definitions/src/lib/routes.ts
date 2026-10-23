import { routeLensFacet, routeShortcutFacet } from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { DEFINITIONS_TERM_URL, DEFINITIONS_URL } from "./constants.js";
import { MESSAGES } from "./i18n/index.js";
import { DefinitionsIcon } from "./ui/DefinitionsIcon/index.js";
import { DefinitionsPage } from "./ui/DefinitionsPage/index.js";
import warmDefinitions from "./warmDefinitions.js";

// Every lens domain keeps its route table in a `routes.ts` barrel, the one
// file a site's route table reads a lens from, so this file keeps that
// shared name rather than the name of its one export.

/**
 * The Definitions lens's two routes, by the names a site's route table keeps
 * them under: the explorer (`definitions`, `/definitions`, the lens index the
 * rail, the breadcrumb and the lens shortcut link to) and the term view
 * (`definitionsTerm`, `/definitions/:term`, the term as a percent-encoded
 * compact address, e.g. `/definitions/ds%3AUIBlock`). Both mount the same
 * page over the same one operation (`definitionsQuery.ts`), and both reach
 * the store through `warm: warmDefinitions`, the one seam between the router
 * and the data layer:
 *
 * - on the server, the site's prepare step awaits it with a per-request
 *   environment and serialises the store for hydration;
 * - on hover (router-react's `Link`) and on the first browser load it runs
 *   against the browser environment, where it does nothing when the store
 *   already holds the data.
 *
 * The explorer declares the lens (`routeLensFacet`) and its shortcut digit.
 * A site groups both routes under a wrapper of `DefinitionsLayout`, whose
 * strip carries the trail, the filter chips and the status figure.
 *
 * `import { definitionsRoutes } from "@canonical/prism-lens-definitions";`
 */
export const definitionsRoutes = {
  definitions: route({
    url: DEFINITIONS_URL,
    content: DefinitionsPage,
    warm: warmDefinitions,
    meta: {
      ...routeShortcutFacet.of("3"),
      // Route meta is built at module scope, where no hook can run, so the
      // label reads the catalog constant rather than the translator.
      ...routeLensFacet.of({
        label: MESSAGES["lens.label"],
        icon: DefinitionsIcon,
        order: 3,
        tier: 1,
      }),
    },
  }),
  definitionsTerm: route({
    url: DEFINITIONS_TERM_URL,
    content: DefinitionsPage,
    warm: warmDefinitions,
  }),
} as const;
