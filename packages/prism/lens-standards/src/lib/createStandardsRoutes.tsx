import { routeLensFacet, routeShortcutFacet } from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { MESSAGES } from "./i18n/index.js";
import type { StandardsBinding, StandardsRoutes } from "./types.js";
import { StandardReadingPage } from "./ui/StandardReadingPage/index.js";
import { StandardsIcon } from "./ui/StandardsIcon/index.js";
import { StandardsPage } from "./ui/StandardsPage/index.js";
import warmStandardEntity from "./warmStandardEntity.js";
import warmStandardsIndex from "./warmStandardsIndex.js";

/**
 * Create the Standards lens's two routes for the class a site binds it to,
 * under the names a site's route table keeps them by:
 *
 * - `standards`, at `/standards`: the bound class's instances grouped by
 *   their own class. It declares the lens (`routeLensFacet`) and its
 *   shortcut digit, so the rail, the trail and the shortcut link to it.
 * - `standardEntity`, at `/standards/:uri`: one standard, addressed by its
 *   percent-encoded absolute IRI
 *   (`/standards/http%3A%2F%2Fpragma.canonical.com%2Fcodestandards%23code.array.safe_access`).
 *
 * Each route reaches the store through its `warm`, the one seam between the
 * router and the data layer: on the server the site's prepare step awaits it
 * with a per-request environment and serialises the store for hydration; on
 * hover and on the first browser load it runs against the browser
 * environment, where it does nothing when the store already holds the data.
 *
 * The binding's class becomes a GraphQL variable, so a site passes it as a
 * module constant: the server's prepare step and the browser's hydration
 * must compute byte-identical variables for the warm store to fulfil the
 * page's operation. A site groups both routes under a wrapper of
 * `StandardsLayout`.
 *
 * `import { createStandardsRoutes } from "@canonical/prism-lens-standards";`
 *
 * @param binding - The class whose instances are the site's standards.
 * @returns The two routes, keyed by their names.
 * @throws When the binding names no class.
 */
export default function createStandardsRoutes(
  binding: StandardsBinding,
): StandardsRoutes {
  const { classUri } = binding;
  if (typeof classUri !== "string" || classUri.length === 0) {
    throw new Error(
      "createStandardsRoutes: the binding's classUri must be a non-empty string",
    );
  }

  return {
    standards: route({
      url: "/standards",
      content: () => <StandardsPage classUri={classUri} />,
      warm: () => warmStandardsIndex(binding),
      meta: {
        ...routeShortcutFacet.of("4"),
        // Route meta is built when the routes are, where no hook can run, so
        // the label reads the catalog constant rather than the translator.
        ...routeLensFacet.of({
          label: MESSAGES["lens.label"],
          icon: StandardsIcon,
          order: 4,
          tier: 2,
        }),
      },
    }),
    standardEntity: route({
      url: "/standards/:uri",
      content: ({ params }) => (
        <StandardReadingPage classUri={classUri} params={params} />
      ),
      warm: (params) => warmStandardEntity(binding, params),
    }),
  };
}
