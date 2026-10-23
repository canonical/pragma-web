import {
  createStaticRouter,
  HomesProvider,
  RouterLink,
} from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { HeadProvider } from "@canonical/react-head";
import { RouterProvider } from "@canonical/router-react";
import type { ElementType, ReactElement } from "react";
import createStandardsRoutes from "../../src/lib/createStandardsRoutes.js";
import { HOMES, STANDARDS_BINDING_FIXTURE } from "../../testing/fixtures.js";

/** The lens's own two routes, bound as a pragma site binds them. */
const routes = createStandardsRoutes(STANDARDS_BINDING_FIXTURE);

/** A site's document title template: the page's title, then the site's. */
const formatDocumentTitle = (title: string): string => `${title} — Docs`;

interface WithSiteOptions {
  /** The address the story's router matches. Defaults to the index. */
  readonly url?: string;
}

/**
 * Storybook decorator that gives a story the nest a site mounts the lens
 * in: the site's document-title template, a static router over the lens's two routes
 * at `url`, the site's homes, and the default projection maps with the
 * router link adapter, so the index's entries, the back link, the trail and
 * every mention in a standard's prose build their hrefs. The Relay addon's
 * mock environment, which a story asks for through `parameters.relay`,
 * wraps it.
 *
 * @param options - The address the router matches.
 * @returns The decorator.
 *
 * @example
 * ```ts
 * decorators: [withSite({ url: "/standards" })]
 * ```
 */
const withSite =
  ({ url = "/standards" }: WithSiteOptions = {}) =>
  (Story: ElementType): ReactElement => (
    <HeadProvider titleTemplate={formatDocumentTitle}>
      <RouterProvider router={createStaticRouter(routes, url)}>
        <HomesProvider homes={HOMES}>
          <ProjectionsProvider
            LinkComponent={RouterLink}
            maps={defaultProjectionMaps}
          >
            <Story />
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </HeadProvider>
  );

export default withSite;
