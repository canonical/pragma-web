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
import type { ReactElement } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { FetchFunction } from "relay-runtime";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { definitionsRoutes } from "../src/lib/routes.js";
import { DefinitionsPage } from "../src/lib/ui/DefinitionsPage/index.js";
import { LensFilterProvider } from "../src/lib/ui/LensFilterProvider/index.js";
import { HOMES } from "./fixtures.js";

/**
 * Build the definitions page at `term` (undefined: the `/definitions`
 * explorer) under the provider stack a site mounts it in: a Relay
 * environment seeded with `records` (`undefined`: a cold store) and a static
 * router over the lens's own two routes at the page's URL, because the rail, the well's nodes and the inspector all render
 * router `Link`s whose hrefs and `aria-current` selection come from the
 * `definitionsTerm` codec.
 *
 * The homes and the default projection maps sit inside the router, because
 * the inspector mentions a class's instances as entity chips that link to
 * their homes through it. `LensFilterProvider` is part of the stack because
 * `DefinitionsLayout` wraps the page in it on every real render; without it
 * the context's inert fallback would swallow every filter change, and the
 * rail's dimming tests would pass or fail for the wrong reason. The page
 * owns its Suspense and error boundaries; the layout stays out.
 *
 * @param term - The selected term, or undefined for the explorer.
 * @param records - The store to seed the environment with, or undefined.
 * @param fetchFn - The network the environment falls back to.
 * @returns The page under its providers, ready to render.
 */
export default function createDefinitionsPage(
  term: string | undefined,
  records: RecordMap | undefined,
  fetchFn: FetchFunction,
): ReactElement {
  return (
    <RelayEnvironmentProvider
      environment={createEnvironment({ records, fetchFn })}
    >
      <RouterProvider
        router={createStaticRouter(
          definitionsRoutes,
          term === undefined
            ? "/definitions"
            : definitionsRoutes.definitionsTerm.render({ term }),
        )}
      >
        <HomesProvider homes={HOMES}>
          <ProjectionsProvider maps={defaultProjectionMaps}>
            <LensFilterProvider>
              <DefinitionsPage
                params={term === undefined ? {} : { term }}
                search={{}}
              />
            </LensFilterProvider>
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>
  );
}
