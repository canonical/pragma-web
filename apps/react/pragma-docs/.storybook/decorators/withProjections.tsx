import { HomesProvider, RouterLink } from "@canonical/prism-core";
import { ProjectionLinkProvider } from "@canonical/prism-projections";
import type { ElementType } from "react";
import { homes } from "../../src/homes.js";
import { SiteRenderers } from "../../src/lib/ui/SiteRenderers/index.js";

/**
 * Storybook decorator that provides the site's homes, the projection
 * link provider, the router link adapter and the site's renderers, as
 * `Shell` does, so a
 * story's entity chips dispatch on their node's type and link to its home.
 *
 * Its homes build hrefs through the router, so list it before
 * `withRouter`, which then wraps it.
 *
 * @example
 * ```ts
 * decorators: [withProjections(), withRouter({ routes })]
 * ```
 */
const withProjections = () => (Story: ElementType) => (
  <HomesProvider homes={homes}>
    <ProjectionLinkProvider LinkComponent={RouterLink}>
      <SiteRenderers>
        <Story />
      </SiteRenderers>
    </ProjectionLinkProvider>
  </HomesProvider>
);

export default withProjections;
