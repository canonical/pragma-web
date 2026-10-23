import { HeadProvider } from "@canonical/react-head";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import type { ElementType, ReactElement } from "react";
import formatDocumentTitle from "../../src/formatDocumentTitle.js";
import { appRoutes } from "../../src/routes.js";

interface WithRouterOptions {
  /** The address the story's router starts at. Defaults to `/`. */
  readonly url?: string;
}

/**
 * Storybook decorator that wraps a story in the site's router and its
 * document-title template, as `Shell` does.
 *
 * The router holds the app's real route table, so the rail lists the site's
 * lenses, the brand links to the landing, and every home builds its
 * href. It starts at `url` on a memory adapter, so a story mounts at a
 * lens's address without a server and without touching the page's own
 * location. The decorator renders no `Outlet`: the story renders the
 * component under test, and a story that renders a lens page places the
 * `Outlet` in its own render.
 *
 * @param options - The address the router starts at.
 * @returns The decorator.
 *
 * @example
 * ```ts
 * decorators: [withRouter()]
 * decorators: [withRouter({ url: "/stations" })]
 * ```
 */
const withRouter =
  ({ url = "/" }: WithRouterOptions = {}) =>
  (Story: ElementType): ReactElement => (
    <HeadProvider titleTemplate={formatDocumentTitle}>
      <RouterProvider
        router={createRouter(appRoutes, { adapter: createMemoryAdapter(url) })}
      >
        <Story />
      </RouterProvider>
    </HeadProvider>
  );

export default withRouter;
