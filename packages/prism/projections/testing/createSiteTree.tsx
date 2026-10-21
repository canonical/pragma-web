import {
  createEnvironment,
  type HomeNode,
  type HomeResolver,
  type Homes,
  HomesProvider,
} from "@canonical/prism-core";
import {
  createMemoryAdapter,
  createRouter,
  type Router,
  route,
} from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import type { ReactElement, ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { Environment } from "relay-runtime";
import {
  defaultProjectionMaps,
  type ProjectionMaps,
  ProjectionsProvider,
} from "../src/lib/projections/index.js";

/** A site's route table with one entity page, addressed by the entity. */
const THING_ROUTES = {
  thing: route({ url: "/things/:uri", content: () => null }),
} as const;

/** Build the thing page's href for `node`, through the router. */
const buildThingPath = (
  node: HomeNode,
  router: Router<typeof THING_ROUTES>,
): string => router.buildPath("thing", { params: { uri: node.uri } });

/**
 * The site's homes: ontology classes live on the thing page. Typed over the
 * fixture table: a site registers its own route map, a test cannot.
 */
const HOMES: Homes = {
  OntologyClass: buildThingPath as unknown as HomeResolver,
};

/** Options for `createSiteTree`. */
export interface SiteTreeOptions {
  /** The maps to provide, in place of `defaultProjectionMaps`. */
  readonly maps?: ProjectionMaps;
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
  environment: Environment,
  children: ReactNode,
  { maps = defaultProjectionMaps }: SiteTreeOptions = {},
): ReactElement {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <RouterProvider
        router={createRouter(THING_ROUTES, {
          adapter: createMemoryAdapter("/"),
        })}
      >
        <HomesProvider homes={HOMES}>
          <ProjectionsProvider maps={maps}>{children}</ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>
  );
}
