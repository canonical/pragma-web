import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import type { ElementType } from "react";
import { STORY_ROUTES } from "./constants.js";

/**
 * Storybook decorator that wraps a story in a router over `STORY_ROUTES`,
 * in memory at `initialUrl`, so the rail, the breadcrumbs and the links
 * resolve their routes without a server.
 *
 * @example
 * ```ts
 * decorators: [withRouter("/glossary")]
 * ```
 */
const withRouter =
  (initialUrl = "/") =>
  (Story: ElementType) => (
    <RouterProvider
      router={createRouter(STORY_ROUTES, {
        adapter: createMemoryAdapter(initialUrl),
      })}
    >
      <Story />
    </RouterProvider>
  );

export default withRouter;
