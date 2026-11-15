import { HomesProvider, RouterLink } from "@canonical/prism-core";
import { ProjectionLinkProvider } from "@canonical/prism-projections";
import type { ElementType, ReactElement } from "react";
import { SITE_SWITCHES } from "#lib/ui";
import { homes } from "../../src/homes.js";
import { SiteRenderers } from "../../src/lib/ui/SiteRenderers/index.js";

/**
 * Storybook decorator that gives a story the nest `Shell` gives the app: the
 * site's homes, the projection link provider with the site's switches,
 * the router link adapter and the site's
 * renderers, so every
 * mention of a graph node renders through its type's arm and links to the
 * page that owns it.
 *
 * The homes build their hrefs through the router, so list it before
 * `withRouter`, which then wraps it.
 *
 * @returns The decorator.
 *
 * @example
 * ```ts
 * decorators: [withProjections(), withRouter({ url: "/stations" })]
 * ```
 */
const withProjections =
  () =>
  (Story: ElementType): ReactElement => (
    <HomesProvider homes={homes}>
      <ProjectionLinkProvider LinkComponent={RouterLink} site={SITE_SWITCHES}>
        <SiteRenderers>
          <Story />
        </SiteRenderers>
      </ProjectionLinkProvider>
    </HomesProvider>
  );

export default withProjections;
