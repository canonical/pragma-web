import { HomesProvider, RouterLink } from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { HeadProvider } from "@canonical/react-head";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import type { ElementType, ReactElement } from "react";
import { EntityFilterProvider } from "../../src/lib/EntityFilterProvider/index.js";
import { HOMES, SITE_ROUTES } from "../../testing/fixtures.js";

/** A site's document title template: the page's title, then the site's. */
const formatDocumentTitle = (title: string): string => `${title} — Metro`;

interface WithSiteOptions {
  /** The address the story's router starts at. Defaults to the stations. */
  readonly url?: string;
}

/**
 * Storybook decorator that gives a story the nest a site mounts the lens
 * in: the site's document-title template, a router over a memory history
 * holding a site's two entity lenses (its stations and its lines) at `url`,
 * the site's homes, the default projection maps with the router link
 * adapter, and the lens's filter, so the index's entries, the trail, the
 * strip's controls and the view toggle work as they do in the site. The
 * Relay addon's mock environment, which a story asks for through
 * `parameters.relay`, wraps it.
 *
 * @param options - The address the router starts at.
 * @returns The decorator.
 *
 * @example
 * ```ts
 * decorators: [withSite({ url: "/stations/metro%3Anorthgate" })]
 * ```
 */
const withSite =
  ({ url = "/stations" }: WithSiteOptions = {}) =>
  (Story: ElementType): ReactElement => (
    <HeadProvider titleTemplate={formatDocumentTitle}>
      <RouterProvider
        router={createRouter(SITE_ROUTES, {
          adapter: createMemoryAdapter(url),
        })}
      >
        <HomesProvider homes={HOMES}>
          <ProjectionsProvider
            LinkComponent={RouterLink}
            maps={defaultProjectionMaps}
          >
            <EntityFilterProvider>
              <Story />
            </EntityFilterProvider>
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </HeadProvider>
  );

export default withSite;
