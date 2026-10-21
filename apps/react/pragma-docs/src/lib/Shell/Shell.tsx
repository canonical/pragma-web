import { HeadProvider } from "@canonical/react-head";
import type { AnyRoute, RouteMap } from "@canonical/router-core";
import { Outlet, RouterProvider } from "@canonical/router-react";
import type { ReactElement } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import formatDocumentTitle from "../../formatDocumentTitle.js";
import type { ShellProps } from "./types.js";

/**
 * The application's provider nest: every context a route's content reads,
 * wrapped around the router's `Outlet`, with the document-title template.
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
          <Outlet fallback={<p>Loading…</p>} />
        </RouterProvider>
      </RelayEnvironmentProvider>
    </HeadProvider>
  );
}
