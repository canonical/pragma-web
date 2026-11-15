import { createEnvironment, HomesProvider } from "@canonical/prism-core";
import type { LinkComponent } from "@canonical/react-ds-global";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import type { ReactElement, ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { Environment, IEnvironment } from "relay-runtime";
import {
  ProjectionLinkProvider,
  type SiteSwitches,
} from "../src/lib/projections/index.js";
import { HOMES, THING_ROUTES } from "./fixtures.js";

/**
 * A site's five switches that render nothing, for a test to replace the
 * one form it probes.
 */
export const NO_SITE_SWITCHES: SiteSwitches = {
  chip: () => null,
  row: () => null,
  card: () => null,
  command: () => null,
  graphNode: () => null,
};

/** Options for `createSiteTree`. */
export interface SiteTreeOptions {
  /** The site's switches to provide; none by default. */
  readonly site?: SiteSwitches;
  /**
   * The link a node's home renders through, in place of the provider's default.
   */
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
 * router over one entity page, the site's homes and the projection link
 * provider, with no site switches unless the test gives them.
 */
export default function createSiteTree(
  environment: IEnvironment,
  children: ReactNode,
  { site, LinkComponent }: SiteTreeOptions = {},
): ReactElement {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <RouterProvider
        router={createRouter(THING_ROUTES, {
          adapter: createMemoryAdapter("/"),
        })}
      >
        <HomesProvider homes={HOMES}>
          <ProjectionLinkProvider LinkComponent={LinkComponent} site={site}>
            {children}
          </ProjectionLinkProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>
  );
}
