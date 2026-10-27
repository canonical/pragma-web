import { createEnvironment, HomesProvider } from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import type { ElementType } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { definitionsRoutes } from "../../src/lib/routes.js";
import { LensFilterProvider } from "../../src/lib/ui/LensFilterProvider/index.js";
import { HOMES } from "../../testing/fixtures.js";

/** Where a story mounts the lens, and the store it reads. */
interface LensSetup {
  /** The URL the lens's router starts at. */
  readonly url?: string;
  /** The captured store the stories read; none for a part without Relay. */
  readonly records?: RecordMap;
}

/**
 * Storybook decorator that mounts a story under the providers a site
 * mounts the lens in: a Relay environment over a captured store, whose
 * network never answers, so the story shows what the store holds and
 * nothing else; a router over the lens's two routes, in memory at `url`;
 * the homes and projection maps the inspector's instance chips read; and
 * the lens's shared state.
 *
 * @example
 * ```ts
 * decorators: [withLens({ url: "/definitions/ds%3AUIBlock", records })]
 * ```
 */
const withLens =
  ({ url = "/definitions", records }: LensSetup = {}) =>
  (Story: ElementType) => (
    <RelayEnvironmentProvider
      environment={createEnvironment({
        records,
        fetchFn: () => new Promise<never>(() => {}),
      })}
    >
      <RouterProvider
        router={createRouter(definitionsRoutes, {
          adapter: createMemoryAdapter(url),
        })}
      >
        <HomesProvider homes={HOMES}>
          <ProjectionsProvider maps={defaultProjectionMaps}>
            <LensFilterProvider>
              <Story />
            </LensFilterProvider>
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>
  );

export default withLens;
