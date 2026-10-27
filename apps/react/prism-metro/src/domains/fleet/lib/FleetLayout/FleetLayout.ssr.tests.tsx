import { createEnvironment } from "@canonical/prism-core";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Shell } from "#lib/ui";
import { appRoutes, notFoundRoute } from "../../../../routes.js";

describe("FleetLayout SSR", () => {
  it("renders the layout, its rail and its bar on the server", () => {
    const html = renderToString(
      <Shell
        environment={createEnvironment({
          fetchFn: () => new Promise<never>(() => {}),
        })}
        router={createRouter(appRoutes, {
          adapter: createMemoryAdapter("/fleet"),
          notFound: notFoundRoute,
        })}
      />,
    );
    expect(html).toContain("ds fleet-layout");
    expect(html).toMatch(/class="ds mode-strip"/);
  });
});
