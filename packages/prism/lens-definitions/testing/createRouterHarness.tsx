import { createStaticRouter } from "@canonical/prism-core";
import { RouterProvider } from "@canonical/router-react";
import type { ReactElement, ReactNode } from "react";
import { definitionsRoutes } from "../src/lib/routes.js";
import { LensFilterProvider } from "../src/lib/ui/LensFilterProvider/index.js";

/**
 * Mount a part of the lens under a static router over the lens's two
 * routes at `url`, which its term links resolve against, and the lens's
 * shared state.
 *
 * @param children - What to mount.
 * @param url - The URL the router matches; the explorer by default.
 * @returns The part under its providers, ready to render.
 */
export default function createRouterHarness(
  children: ReactNode,
  url = "/definitions",
): ReactElement {
  return (
    <RouterProvider router={createStaticRouter(definitionsRoutes, url)}>
      <LensFilterProvider>{children}</LensFilterProvider>
    </RouterProvider>
  );
}
