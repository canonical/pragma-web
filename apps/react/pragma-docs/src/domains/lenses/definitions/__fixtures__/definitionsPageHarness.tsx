/**
 * Shared harness for the Definitions lens's warm-store tests: the REAL
 * `DefinitionsPage` under the real provider stack — Relay environment
 * (seeded or cold), `HeadProvider`, and a static router over the REAL app
 * routes at the page's own URL, because the rail, the well's nodes, and
 * the inspector all render router-react `Link`s whose hrefs (and
 * `aria-current` selection) must come from the actual `definitionsTerm`
 * codec.
 *
 * Lives in `__fixtures__` beside the captured record maps: imported by
 * tests, never collected as one.
 */

import {
  createEnvironment,
  createStaticRouter,
  HomesProvider,
} from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { HeadProvider } from "@canonical/react-head";
import { RouterProvider } from "@canonical/router-react";
import type { ReactElement } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { FetchFunction } from "relay-runtime";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { RouterLink } from "#lib/RouterLink";
import formatDocumentTitle from "../../../../formatDocumentTitle.js";
import { homes } from "../../../../homes.js";
import { appRoutes, middleware, notFoundRoute } from "../../../../routes.js";
import { DefinitionsPage } from "../DefinitionsPage/index.js";
import { LensFilterProvider } from "../lensFilterContext.js";

/** The primary exemplar the captured fixture serves. */
export const UIBLOCK_TERM = "ds:UIBlock";
/** The property-term exemplar (`definitionsExplorerRecordsProperty`). */
export const PROPERTY_TERM = "ds:hasSubcomponent";

/**
 * Contention insurance (the components lens's F3 precedent,
 * `catalogPageHarness.tsx`): these tests mount the full provider stack +
 * static router + React Flow, which can overrun the 5s default under
 * heavy parallel machine load. Per-test only — the config default stands.
 */
export const DEFINITIONS_TEST_TIMEOUT_MS = 20_000;

/**
 * The definitions page at `term` (undefined = the `/definitions`
 * explorer) over an environment seeded with `records` (`undefined` = cold
 * store). The page owns its Suspense/ErrorBoundary; the router exists for
 * `Link` context and selection only (no Outlet — the lens layout stays out
 * of component tests).
 *
 * The site's homes, the default projection maps and the router link
 * adapter sit inside the router, as `Shell` mounts them, because the
 * inspector mentions a class's instances as entity chips that link to
 * their homes through the router.
 *
 * `LensFilterProvider` is part of the stack because it is part of the
 * stack in production: `DefinitionsLayout` wraps the page in it, so the lens's
 * ephemeral filter is writable on every real render. Without it here the
 * context's inert fallback would silently swallow every filter change and
 * the rail's dimming tests would pass or fail for the wrong reason.
 */
export const definitionsPageAt = (
  term: string | undefined,
  records: RecordMap | undefined,
  fetchFn: FetchFunction,
): ReactElement => (
  <HeadProvider titleTemplate={formatDocumentTitle}>
    <RelayEnvironmentProvider
      environment={createEnvironment({ records, fetchFn })}
    >
      <RouterProvider
        router={createStaticRouter(
          appRoutes,
          term === undefined
            ? "/definitions"
            : appRoutes.definitionsTerm.render({ term }),
          {
            middleware: [...middleware],
            notFound: notFoundRoute,
          },
        )}
      >
        <HomesProvider homes={homes}>
          <ProjectionsProvider
            LinkComponent={RouterLink}
            maps={defaultProjectionMaps}
          >
            <LensFilterProvider>
              <DefinitionsPage params={term === undefined ? {} : { term }} />
            </LensFilterProvider>
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>
  </HeadProvider>
);
