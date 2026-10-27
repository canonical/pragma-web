import { HomesProvider, RouterLink } from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { RouterProvider } from "@canonical/router-react";
import type { ElementType, ReactElement } from "react";
import createSiteRouter from "../../testing/createSiteRouter.js";
import { HOMES } from "../../testing/fixtures.js";

interface WithPaletteSiteOptions {
  /**
   * The inline size of the shell the story renders in, such as `"390px"`
   * for a phone. Defaults to the canvas's width.
   */
  readonly inlineSize?: string;
}

/**
 * Storybook decorator that gives a story the site a palette is mounted in: a
 * router over one entity page, the site's homes, the default projection
 * maps with the router's link, and an element standing in for the site's
 * shell, the query container named `shell`, so the palette re-flows below
 * two groups as it does on the site. The Relay addon's mock environment,
 * which a story asks for through `parameters.relay`, wraps it.
 *
 * @param options - The shell's inline size.
 * @returns The decorator.
 *
 * @example
 * ```ts
 * decorators: [withPaletteSite({ inlineSize: "390px" })]
 * ```
 */
const withPaletteSite =
  ({ inlineSize }: WithPaletteSiteOptions = {}) =>
  (Story: ElementType): ReactElement => (
    <RouterProvider router={createSiteRouter()}>
      <HomesProvider homes={HOMES}>
        <ProjectionsProvider
          LinkComponent={RouterLink}
          maps={defaultProjectionMaps}
        >
          <div style={{ container: "shell / inline-size", inlineSize }}>
            <Story />
          </div>
        </ProjectionsProvider>
      </HomesProvider>
    </RouterProvider>
  );

export default withPaletteSite;
