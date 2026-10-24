/**
 * Shared harness for the Home lobby's warm-store tests: the REAL page
 * under the real provider stack — Relay environment (seeded or cold),
 * `HeadProvider`, a static router over the REAL app routes at `/`, and the
 * site's homes and projection maps, because the exemplar chips and every
 * door link through hrefs that must come from the actual route codecs (an
 * exemplar's chip round-trips the `componentEntity` codec through its
 * home).
 *
 * Lives in `__fixtures__` beside the captured record map: imported by
 * tests, never collected as one. Mirrors `standardsPageHarness.tsx`.
 */

import {
  createEnvironment,
  createStaticRouter,
  HomesProvider,
  RouterLink,
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
import formatDocumentTitle from "../../../formatDocumentTitle.js";
import { homes } from "../../../homes.js";
import { appRoutes, middleware, notFoundRoute } from "../../../routes.js";
import { HomePage } from "../lib/HomePage/index.js";

/**
 * The first exemplar the captured fixture serves — the graph's own
 * ordering puts Accordion first, and of its blocks the global one stands
 * for the title.
 */
export const FIRST_EXEMPLAR_URI = "ds:global.component.accordion";

/** The same exemplar's display name. */
export const FIRST_EXEMPLAR_NAME = "Accordion";

/**
 * Contention insurance (the components lens's F3 precedent,
 * `catalogPageHarness.tsx`): these tests mount the full provider stack +
 * static router, which can overrun the 5s default under heavy parallel
 * machine load. Per-test only — the config default stands.
 */
export const LOBBY_TEST_TIMEOUT_MS = 15_000;

/**
 * The lobby over an environment seeded with `records` (`undefined` = cold
 * store). The page owns its Suspense/ErrorBoundary; the router exists for
 * `Link` context only (no Outlet — the lens layout stays out of component
 * tests).
 */
export const lobbyPage = (
  records: RecordMap | undefined,
  fetchFn: FetchFunction,
): ReactElement => (
  <HeadProvider titleTemplate={formatDocumentTitle}>
    <RelayEnvironmentProvider
      environment={createEnvironment({ records, fetchFn })}
    >
      <RouterProvider
        router={createStaticRouter(appRoutes, "/", {
          middleware: [...middleware],
          notFound: notFoundRoute,
        })}
      >
        <HomesProvider homes={homes}>
          <ProjectionsProvider
            LinkComponent={RouterLink}
            maps={defaultProjectionMaps}
          >
            <HomePage />
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>
  </HeadProvider>
);
