import { HomesProvider } from "@canonical/prism-core";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { appRoutes } from "../../../../routes.js";
import NodeLink from "./NodeLink.js";

describe("NodeLink SSR", () => {
  it("renders plain text on the server for a node with no home", () => {
    const html = renderToString(
      <RouterProvider
        router={createRouter(appRoutes, {
          adapter: createMemoryAdapter("/fleet"),
        })}
      >
        <HomesProvider homes={{}}>
          <NodeLink address="metro:series-90" typename="RollingStock">
            Series 90
          </NodeLink>
        </HomesProvider>
      </RouterProvider>,
    );
    expect(html).toBe('<span class="ds node-link">Series 90</span>');
  });
});
