/**
 * Shared harness for the journeys domain's warm-store tests: the real
 * `JourneysPage` under the real provider stack, a seeded (or cold) Relay
 * environment, `HeadProvider`, and a static router over the real app
 * routes at the page's own URL, because the rail, the table and the well
 * render router links whose hrefs and `aria-current` come from the
 * `journeysJob` route. The router is an in-memory one, hydrated at the
 * page's URL as the static router is, so the strip's switch can write the
 * view to its address as it does in a browser.
 *
 * The view the strip's switch and the canvas share lives in
 * `JourneyViewProvider`, which the layout holds around both, so every
 * render here is under one: `journeysStrip` mounts the strip's switch
 * beside the page under the same provider, `journeysLayoutAt` mounts the
 * page inside the real `JourneysLayout`, and `journeysTenantAt` mounts one
 * of the layout's tenants alone.
 *
 * Lives in `__fixtures__` beside the captured record maps: imported by
 * tests, never collected as one.
 */

import { createEnvironment } from "@canonical/prism-core";
import { HeadProvider } from "@canonical/react-head";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import type { ReactElement, ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { FetchFunction } from "relay-runtime";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import formatDocumentTitle from "../../../formatDocumentTitle.js";
import { appRoutes, middleware, notFoundRoute } from "../../../routes.js";
import buildViewSearch from "../buildViewSearch.js";
import { JOURNEY_VIEW_PARAM } from "../constants.js";
import { Controls } from "../lib/JourneysLayout/common/Controls/index.js";
import { JourneysLayout } from "../lib/JourneysLayout/index.js";
import { JourneysPage } from "../lib/JourneysPage/index.js";
import { JourneyViewProvider } from "../lib/JourneyViewProvider/index.js";
import type { JourneyView } from "../types.js";

/**
 * These tests mount the full provider stack, a static router and the
 * graph well, which can overrun the 5s default under heavy parallel load.
 * Per test only: the config default stands.
 */
export const JOURNEYS_TEST_TIMEOUT_MS = 20_000;

/**
 * A router over the real app routes in memory at `url`, hydrated there at
 * once as the static router is, so the first render already reads the
 * page's match and a search update navigates as it does in a browser.
 */
export const createRouterAt = (url: string) => {
  const router = createRouter(appRoutes, {
    adapter: createMemoryAdapter(url),
    middleware: [...middleware],
    notFound: notFoundRoute,
  });
  const match = router.match(url);
  router.hydrate({
    href: url,
    kind: "route",
    routeId: match?.kind === "route" ? match.name : null,
    status: 200,
  });
  return router;
};

/** The page's URL: the lens index or the job's, in `view`. */
const formatUrl = (job: string | undefined, view: JourneyView): string => {
  const path =
    job === undefined ? "/journeys" : appRoutes.journeysJob.render({ job });
  const search = buildViewSearch(view);
  return search === undefined
    ? path
    : `${path}?${JOURNEY_VIEW_PARAM}=${search[JOURNEY_VIEW_PARAM]}`;
};

/** The real provider stack a journeys page renders under: a seeded (or
 * cold) environment, the title template, and a router over the real app
 * routes at the page's own URL, in `view`. */
const renderUnderProviders = (
  job: string | undefined,
  records: RecordMap | undefined,
  fetchFn: FetchFunction,
  children: ReactNode,
  view: JourneyView = "table",
): ReactElement => (
  <HeadProvider titleTemplate={formatDocumentTitle}>
    <RelayEnvironmentProvider
      environment={createEnvironment({ records, fetchFn })}
    >
      <RouterProvider router={createRouterAt(formatUrl(job, view))}>
        {children}
      </RouterProvider>
    </RelayEnvironmentProvider>
  </HeadProvider>
);

/**
 * The journeys page at `job` (undefined for the `/journeys` index) over an
 * environment seeded with `records` (undefined for a cold store). The page
 * owns its boundaries; the router exists for the links and the selection
 * only, with no outlet.
 */
export const journeysPageAt = (
  job: string | undefined,
  records: RecordMap | undefined,
  fetchFn: FetchFunction,
): ReactElement =>
  renderUnderProviders(
    job,
    records,
    fetchFn,
    <JourneyViewProvider>
      <JourneysPage params={job === undefined ? {} : { job }} />
    </JourneyViewProvider>,
  );

/**
 * The page and the strip's view switch under one `JourneyViewProvider`, as
 * the layout renders them: the switch is a sibling of the canvas. Use it
 * when a test drives the switch and watches the canvas follow.
 */
export const journeysStrip = (
  job: string | undefined,
  records: RecordMap | undefined,
  fetchFn: FetchFunction,
): ReactElement =>
  renderUnderProviders(
    job,
    records,
    fetchFn,
    <JourneyViewProvider>
      <Controls />
      <JourneysPage params={job === undefined ? {} : { job }} />
    </JourneyViewProvider>,
  );

/**
 * The page inside the real `JourneysLayout`, with no provider of its own:
 * the view the strip's switch, the canvas and the inspector share comes
 * from the layout alone, read from the page's URL in `view`.
 */
export const journeysLayoutAt = (
  job: string | undefined,
  records: RecordMap | undefined,
  fetchFn: FetchFunction,
  view: JourneyView = "table",
): ReactElement =>
  renderUnderProviders(
    job,
    records,
    fetchFn,
    <JourneysLayout>
      <JourneysPage params={job === undefined ? {} : { job }} />
    </JourneysLayout>,
    view,
  );

/**
 * One of the layout's tenants at `job` under the view provider the layout
 * holds, with no page beside it: the inspector reads the explorer's
 * operation from the store on its own.
 */
export const journeysTenantAt = (
  job: string | undefined,
  records: RecordMap | undefined,
  fetchFn: FetchFunction,
  children: ReactNode,
): ReactElement =>
  renderUnderProviders(
    job,
    records,
    fetchFn,
    <JourneyViewProvider>{children}</JourneyViewProvider>,
  );
