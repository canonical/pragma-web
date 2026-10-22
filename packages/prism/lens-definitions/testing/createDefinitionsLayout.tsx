import { createEnvironment, createStaticRouter } from "@canonical/prism-core";
import { RouterProvider } from "@canonical/router-react";
import type { ReactElement, ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { FetchFunction } from "relay-runtime";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { DefinitionsLayout } from "../src/lib/DefinitionsLayout/index.js";
import { definitionsRoutes } from "../src/lib/routes.js";

/** What `createDefinitionsLayout` mounts the layout with. */
export interface DefinitionsLayoutSetup {
  /** The URL the static router matches. */
  readonly url: string;
  /** The store to seed the environment with, or undefined for a cold one. */
  readonly records: RecordMap | undefined;
  /** The network the environment falls back to. */
  readonly fetchFn: FetchFunction;
  /** The site's rail. */
  readonly rail: ReactNode;
  /** The site's footer band, if any. */
  readonly colophon?: ReactNode;
  /** The routed page the router would hand the layout. */
  readonly children: ReactNode;
  /** Class names a site adds to the layout's root. */
  readonly className?: string;
}

/**
 * Build `DefinitionsLayout` under the providers a site mounts it in: a
 * Relay environment over `records` and a static router over the lens's two
 * routes at `url`, which the strip's sockets read the current term from.
 *
 * @param setup - The URL, store, network, site slots, routed page and root
 *   class names.
 * @returns The layout under its providers, ready to render.
 */
export default function createDefinitionsLayout({
  url,
  records,
  fetchFn,
  rail,
  colophon,
  children,
  className,
}: DefinitionsLayoutSetup): ReactElement {
  return (
    <RelayEnvironmentProvider
      environment={createEnvironment({ records, fetchFn })}
    >
      <RouterProvider router={createStaticRouter(definitionsRoutes, url)}>
        <DefinitionsLayout
          className={className}
          colophon={colophon}
          rail={rail}
        >
          {children}
        </DefinitionsLayout>
      </RouterProvider>
    </RelayEnvironmentProvider>
  );
}
