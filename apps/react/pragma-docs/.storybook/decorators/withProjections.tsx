import { HomesProvider } from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import type { ElementType } from "react";
import { homes } from "../../src/homes.js";
import { RouterLink } from "../../src/lib/RouterLink/index.js";

/**
 * Storybook decorator that provides the site's homes, the default
 * projection maps and the router link adapter, as `Shell` does, so a
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
    <ProjectionsProvider
      LinkComponent={RouterLink}
      maps={defaultProjectionMaps}
    >
      <Story />
    </ProjectionsProvider>
  </HomesProvider>
);

export default withProjections;
