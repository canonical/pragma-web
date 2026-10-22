import { HomesProvider, RouterLink } from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { HeadProvider } from "@canonical/react-head";
import type { AnyRoute, RouteMap } from "@canonical/router-core";
import { Outlet, RouterProvider } from "@canonical/router-react";
import type { ReactElement } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import formatDocumentTitle from "../../formatDocumentTitle.js";
import { homes } from "../../homes.js";
import type { ShellProps } from "./types.js";

/**
 * The application's provider nest: every context a route's content reads,
 * wrapped around the router's `Outlet`, with the document-title template.
 * Inside the router sit the site's homes and the projection maps, so every
 * mention of a graph node renders through its type's arm and links to the
 * page that owns it, through the router so the link navigates on the client.
 * The client entry and the server entry both render it, so the hydrated tree
 * and the server markup share one nest. Each lens's layout renders below it,
 * through the `Outlet`.
 *
 * Generic over the route map rather than bound to `AppRoutes`, because the
 * route map imports components from `src/lib/`. Renders no element of its
 * own, so its props are the router and the environment alone.
 *
 * `import { Shell } from "#lib/Shell";`
 */
export default function Shell<
  TRoutes extends RouteMap,
  TNotFound extends AnyRoute | undefined = undefined,
>({ router, environment }: ShellProps<TRoutes, TNotFound>): ReactElement {
  return (
    <HeadProvider titleTemplate={formatDocumentTitle}>
      <RelayEnvironmentProvider environment={environment}>
        <RouterProvider router={router}>
          <HomesProvider homes={homes}>
            <ProjectionsProvider
              LinkComponent={RouterLink}
              maps={defaultProjectionMaps}
            >
              <Outlet fallback={<p>Loading…</p>} />
            </ProjectionsProvider>
          </HomesProvider>
        </RouterProvider>
      </RelayEnvironmentProvider>
    </HeadProvider>
  );
}
