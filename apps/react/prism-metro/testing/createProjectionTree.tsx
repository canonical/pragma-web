import { HomesProvider, RouterLink } from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import type { ReactElement, ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { IEnvironment } from "relay-runtime";
import { homes } from "../src/homes.js";
import { appRoutes } from "../src/routes.js";

/**
 * Wrap `children` in the nest a projection renders under on the site: the
 * Relay environment, the site's router at its landing, its homes, and the
 * default projection maps with the router's link, so a projection's home
 * is the href the site's own route builds and a title links through it.
 *
 * @param environment - The Relay environment the projection reads from.
 * @param children - The projection under test.
 * @returns The tree to render.
 */
export default function createProjectionTree(
  environment: IEnvironment,
  children: ReactNode,
): ReactElement {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <RouterProvider
        router={createRouter(appRoutes, { adapter: createMemoryAdapter("/") })}
      >
        <HomesProvider homes={homes}>
          <ProjectionsProvider
            LinkComponent={RouterLink}
            maps={defaultProjectionMaps}
          >
            {children}
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>
  );
}
