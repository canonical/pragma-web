import { HeadProvider } from "@canonical/react-head";
import {
  createHashAdapter,
  createMemoryAdapter,
  createRouter,
  type RouteMap,
  route,
} from "@canonical/router-core";
import { Outlet, RouterProvider } from "@canonical/router-react";
import type { ElementType } from "react";
import formatDocumentTitle from "../../src/formatDocumentTitle.js";

const defaultRoutes = {
  story: route({
    url: "/",
    content: () => null,
  }),
} as const;

interface WithRouterOptions {
  readonly routes?: RouteMap;
}

/** A story's router parameters: the address it opens at, in memory. */
interface RouterParameters {
  readonly url?: string;
}

/**
 * Storybook decorator that wraps stories in a router context.
 *
 * Uses a hash router so visual tests can navigate without a real server.
 * Pass custom routes to test components that depend on specific route shapes.
 * A story that sets `parameters.router.url` opens at that address, its search
 * included, in memory.
 *
 * @example
 * ```ts
 * decorators: [withRouter()]
 * decorators: [withRouter({ routes: appRoutes })]
 * parameters: { router: { url: "/?select=ds%3Aglobal.component.button" } }
 * ```
 */
const withRouter =
  ({ routes = defaultRoutes }: WithRouterOptions = {}) =>
  (
    Story: ElementType,
    {
      parameters,
    }: { readonly parameters: { readonly router?: RouterParameters } },
  ) => {
    const url = parameters.router?.url;
    // `createHashRouter` is not part of main's public router surface; the
    // adapter it wrapped is. Same behaviour, one layer less indirection.
    const router = createRouter(routes, {
      adapter:
        url === undefined ? createHashAdapter() : createMemoryAdapter(url),
    });

    return (
      <HeadProvider titleTemplate={formatDocumentTitle}>
        <RouterProvider router={router}>
          <Story />
          <Outlet />
        </RouterProvider>
      </HeadProvider>
    );
  };

export default withRouter;
