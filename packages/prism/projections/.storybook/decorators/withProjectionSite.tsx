import { HomesProvider } from "@canonical/prism-core";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import type { ElementType, ReactElement } from "react";
import { ProjectionLinkProvider } from "../../src/lib/projections/index.js";
import { HOMES, THING_ROUTES } from "../../testing/fixtures.js";

/**
 * Storybook decorator that gives a projection the site it links into: a
 * router over one entity page, the site's homes and the projection link
 * provider, so a homed entity's title links to its page.
 *
 * @returns The decorator.
 *
 * @example
 * ```ts
 * decorators: [withRelayEnvironment, withProjectionSite()]
 * ```
 */
const withProjectionSite =
  () =>
  (Story: ElementType): ReactElement => (
    <RouterProvider
      router={createRouter(THING_ROUTES, {
        adapter: createMemoryAdapter("/"),
      })}
    >
      <HomesProvider homes={HOMES}>
        <ProjectionLinkProvider>
          <Story />
        </ProjectionLinkProvider>
      </HomesProvider>
    </RouterProvider>
  );

export default withProjectionSite;
