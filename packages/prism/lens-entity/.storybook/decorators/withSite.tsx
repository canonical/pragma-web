import {
  HomesProvider,
  RenderersProvider,
  RouterLink,
  usePageRenderers,
} from "@canonical/prism-core";
import {
  ProjectionLinkProvider,
  useListRenderers,
} from "@canonical/prism-projections";
import { HeadProvider } from "@canonical/react-head";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import type { ElementType, ReactElement, ReactNode } from "react";
import { HOMES, SITE_ROUTES } from "../../testing/fixtures.js";
import type { SiteExtension } from "../../testing/types.js";

/** The site's renderers, over a provider that serves source. */
const SiteRenderers = ({
  children,
  extensions,
}: {
  readonly children: ReactNode;
  readonly extensions: readonly SiteExtension[];
}): ReactElement => (
  <RenderersProvider
    defaults={{ list: useListRenderers(), page: usePageRenderers() }}
    extensions={extensions}
  >
    {children}
  </RenderersProvider>
);

/** A site's document title template: the page's title, then the site's. */
const formatDocumentTitle = (title: string): string => `${title} — Metro`;

interface WithSiteOptions {
  /** The address the story's router starts at. Defaults to the stations. */
  readonly url?: string;
  /** The extensions the site's provider serves; `source` alone when omitted. */
  readonly extensions?: readonly SiteExtension[];
}

/**
 * Storybook decorator that gives a story the nest a site mounts the lens
 * in: the site's document-title template, a router over a memory history
 * holding a site's two entity lenses (its stations and its lines) at `url`,
 * the site's homes, the projection link provider with the router link
 * adapter, and the site's renderers, so the index's entries, the trail, the
 * strip's search and the renderer switch work as they do in the site. The
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
  ({ url = "/stations", extensions = ["source"] }: WithSiteOptions = {}) =>
  (Story: ElementType): ReactElement => (
    <HeadProvider titleTemplate={formatDocumentTitle}>
      <RouterProvider
        router={createRouter(SITE_ROUTES, {
          adapter: createMemoryAdapter(url),
        })}
      >
        <HomesProvider homes={HOMES}>
          <ProjectionLinkProvider LinkComponent={RouterLink}>
            <SiteRenderers extensions={extensions}>
              <Story />
            </SiteRenderers>
          </ProjectionLinkProvider>
        </HomesProvider>
      </RouterProvider>
    </HeadProvider>
  );

export default withSite;
