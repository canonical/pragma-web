/**
 * Shared harness for the catalog's warm-store tests: the REAL
 * `ComponentsCatalogPage` under the real provider stack — Relay
 * environment (seeded or cold), `HeadProvider`, a static router over the
 * REAL app routes, and the site's homes and projection maps, because the
 * catalog's cards and rows link through hrefs that must come from the
 * actual `componentEntity` codec.
 *
 * Lives in `__fixtures__` beside the captured record maps: imported by
 * tests, never collected as one.
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
import { ComponentsCatalogPage } from "../lib/ComponentsCatalogPage/index.js";

/**
 * Contention insurance (fix-pass F3): these tests mount the full provider
 * stack + static router, which can overrun the 5s default under heavy
 * parallel machine load. Per-test only — the config default stands.
 */
export const HARNESS_TEST_TIMEOUT_MS = 15_000;

/**
 * A static router over the app's routes at `url`, as the catalog reads its
 * view off the address.
 */
export const createCatalogRouter = (url = "/components") =>
  createStaticRouter(appRoutes, url, {
    middleware: [...middleware],
    notFound: notFoundRoute,
  });

/**
 * The catalog page over an environment seeded with `records` (`undefined`
 * = cold store), under the site's homes and projection maps. The page owns
 * its Suspense/ErrorBoundary; the router carries the address the view is
 * read from (no Outlet — the lens layout stays out of component tests).
 */
export const catalogPage = (
  records: RecordMap | undefined,
  fetchFn: FetchFunction,
  router = createCatalogRouter(),
): ReactElement => (
  <HeadProvider titleTemplate={formatDocumentTitle}>
    <RelayEnvironmentProvider
      environment={createEnvironment({ records, fetchFn })}
    >
      <RouterProvider router={router}>
        <HomesProvider homes={homes}>
          <ProjectionsProvider
            LinkComponent={RouterLink}
            maps={defaultProjectionMaps}
          >
            <ComponentsCatalogPage />
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>
  </HeadProvider>
);
