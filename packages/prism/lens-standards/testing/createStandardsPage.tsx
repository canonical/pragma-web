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
import type { ReactElement, ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { FetchFunction } from "relay-runtime";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import createStandardsRoutes from "../src/lib/createStandardsRoutes.js";
import { HOMES, STANDARDS_BINDING_FIXTURE } from "./fixtures.js";

/** The lens's own two routes, bound as a pragma site binds them. */
const routes = createStandardsRoutes(STANDARDS_BINDING_FIXTURE);

/** A site's document title template: the page's title, then the site's. */
const formatDocumentTitle = (title: string): string => `${title} — Docs`;

/**
 * Mount `page` under the provider stack a site mounts the lens in:
 * `HeadProvider` with a site's title template, a Relay environment seeded with `records` (`undefined`: a
 * cold store), and a static router over the lens's own two routes at `url`,
 * because the index's links, the breadcrumb and the trail render router
 * `Link`s whose hrefs come from the `standards` and `standardEntity` codecs.
 * The homes and the default projection maps sit inside the router, because
 * a mention in a standard's prose renders as a chip that links to its home
 * through it.
 *
 * @param url - The URL the static router matches.
 * @param records - The store to seed the environment with, or undefined.
 * @param fetchFn - The network the environment falls back to.
 * @param page - The page, or layout, to mount.
 * @returns The page under its providers, ready to render.
 */
export default function createStandardsPage(
  url: string,
  records: RecordMap | undefined,
  fetchFn: FetchFunction,
  page: ReactNode,
): ReactElement {
  return (
    <HeadProvider titleTemplate={formatDocumentTitle}>
      <RelayEnvironmentProvider
        environment={createEnvironment({ records, fetchFn })}
      >
        <RouterProvider router={createStaticRouter(routes, url)}>
          <HomesProvider homes={HOMES}>
            <ProjectionsProvider maps={defaultProjectionMaps}>
              {page}
            </ProjectionsProvider>
          </HomesProvider>
        </RouterProvider>
      </RelayEnvironmentProvider>
    </HeadProvider>
  );
}
