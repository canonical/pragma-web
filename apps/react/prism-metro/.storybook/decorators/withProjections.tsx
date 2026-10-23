import { HomesProvider, RouterLink } from "@canonical/prism-core";
import { ProjectionsProvider } from "@canonical/prism-projections";
import type { ElementType, ReactElement } from "react";
import { metroProjectionMaps } from "#domains/metro";
import { homes } from "../../src/homes.js";

/**
 * Storybook decorator that gives a story the nest `Shell` gives the app: the
 * site's homes, its projection maps and the router link adapter, so every
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
      <ProjectionsProvider
        LinkComponent={RouterLink}
        maps={metroProjectionMaps}
      >
        <Story />
      </ProjectionsProvider>
    </HomesProvider>
  );

export default withProjections;
