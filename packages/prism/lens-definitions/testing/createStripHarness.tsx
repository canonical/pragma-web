import {
  createEnvironment,
  createStaticRouter,
  HomesProvider,
} from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { RouterProvider } from "@canonical/router-react";
import type { ReactElement, ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { FetchFunction } from "relay-runtime";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { definitionsRoutes } from "../src/lib/routes.js";
import { LensFilterProvider } from "../src/lib/ui/LensFilterProvider/index.js";
import { HOMES } from "./fixtures.js";

/**
 * Mount strip tenants under the providers `DefinitionsLayout` renders them
 * in: a Relay environment over `records` (`undefined`: a cold store), a
 * static router over the lens's two routes at `url`, the homes and
 * projection maps the inspector's instance chips read, and the shared
 * filter.
 *
 * @param url - The URL the static router matches.
 * @param records - The store to seed the environment with, or undefined.
 * @param fetchFn - The network the environment falls back to.
 * @param children - The tenants to mount.
 * @returns The tenants under their providers, ready to render.
 */
export default function createStripHarness(
  url: string,
  records: RecordMap | undefined,
  fetchFn: FetchFunction,
  children: ReactNode,
): ReactElement {
  return (
    <RelayEnvironmentProvider
      environment={createEnvironment({ records, fetchFn })}
    >
      <RouterProvider router={createStaticRouter(definitionsRoutes, url)}>
        <HomesProvider homes={HOMES}>
          <ProjectionsProvider maps={defaultProjectionMaps}>
            <LensFilterProvider>{children}</LensFilterProvider>
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>
  );
}
