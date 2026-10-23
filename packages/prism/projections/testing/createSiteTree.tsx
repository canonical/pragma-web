import { createEnvironment, HomesProvider } from "@canonical/prism-core";
import type { LinkComponent } from "@canonical/react-ds-global";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import type { ReactElement, ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { Environment, IEnvironment } from "relay-runtime";
import { defaultProjectionMaps } from "../src/lib/node/index.js";
import {
  type ProjectionMaps,
  ProjectionsProvider,
} from "../src/lib/projections/index.js";
import { HOMES, THING_ROUTES } from "./fixtures.js";

/** Options for `createSiteTree`. */
export interface SiteTreeOptions {
  /** The maps to provide, in place of `defaultProjectionMaps`. */
  readonly maps?: ProjectionMaps;
  /** The link a node's home renders through, in place of the provider's default. */
  readonly LinkComponent?: LinkComponent;
}

/**
 * Create the store a site's page reads from: one that never fetches, so a
 * test commits every record it renders.
 */
export const createStoreOnlyEnvironment = (): Environment =>
  createEnvironment({
    fetchFn: () => Promise.reject(new Error("the store holds every record")),
  });

/**
 * Wrap `children` in the providers a site mounts: the Relay environment, a
 * router over one entity page, the site's homes and the projection maps.
 */
export default function createSiteTree(
  environment: IEnvironment,
  children: ReactNode,
  { maps = defaultProjectionMaps, LinkComponent }: SiteTreeOptions = {},
): ReactElement {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <RouterProvider
        router={createRouter(THING_ROUTES, {
          adapter: createMemoryAdapter("/"),
        })}
      >
        <HomesProvider homes={HOMES}>
          <ProjectionsProvider LinkComponent={LinkComponent} maps={maps}>
            {children}
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>
  );
}
