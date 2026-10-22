import { HomesProvider, RouterLink } from "@canonical/prism-core";
import { ProjectionsProvider } from "@canonical/prism-projections";
import { HeadProvider } from "@canonical/react-head";
import type { AnyRoute, RouteMap } from "@canonical/router-core";
import { Outlet, RouterProvider } from "@canonical/router-react";
import type { ReactElement } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { MESSAGES } from "#i18n";
import { metroProjectionMaps } from "#projections";
import formatDocumentTitle from "../../formatDocumentTitle.js";
import { homes } from "../../homes.js";
import type { ShellProps } from "./types.js";

/**
 * The application's provider nest: every context a route's content reads,
 * wrapped around the router's `Outlet`, with the document-title template.
 * Inside the router sit the site's homes and its projection maps, so every
 * mention of a graph node renders through its type's arm and links to the
 * page that owns it. The client entry and the server entry both render it,
 * so the hydrated tree and the server markup share one nest. Each lens's
 * layout renders below it, through the `Outlet`.
 *
 * The projections render a home through prism-core's `RouterLink`, so every
 * mention navigates on the client through the router: a plain click loads
 * and renders the destination in place, and hovering it warms its data.
 *
 * Generic over the route map rather than bound to `AppRoutes`, so the test
 * harnesses mount it over route tables of their own. Renders no element of
 * its own, so its props are the router and the environment alone.
 *
 * `import { Shell } from "#shell";`
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
              maps={metroProjectionMaps}
            >
              <Outlet fallback={<p>{MESSAGES["shell.loading"]}</p>} />
            </ProjectionsProvider>
          </HomesProvider>
        </RouterProvider>
      </RelayEnvironmentProvider>
    </HeadProvider>
  );
}
