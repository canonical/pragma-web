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
 * Wrap `children` in the providers the site's `Shell` mounts around a
 * projection: the Relay environment, a router over the site's own routes at
 * `url` (`/` by default), the site's homes, and the default projection maps
 * with the router's link, so a homed entity's title links to its page as on
 * the site.
 */
export default function createSiteTree(
  environment: IEnvironment,
  children: ReactNode,
  url = "/",
): ReactElement {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <RouterProvider
        router={createRouter(appRoutes, { adapter: createMemoryAdapter(url) })}
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
