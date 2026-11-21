// Scaffolded by @canonical/summon-component:react v0.46.0

import {
  createMemoryAdapter,
  createRouter,
  route,
} from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import TypeFacetBar from "./TypeFacetBar.js";

const routes = { search: route({ url: "/search", content: () => null }) };

describe("TypeFacetBar SSR", () => {
  it("renders its values on the server with a fixed label id", () => {
    const html = renderToString(
      <RouterProvider
        router={createRouter(routes, {
          adapter: createMemoryAdapter("/search?q=n"),
        })}
      >
        <TypeFacetBar
          facets={[
            {
              id: "a",
              label: "Line",
              count: 2,
              href: "/search?type=a",
              selected: false,
            },
            {
              id: "b",
              label: "Zone",
              count: 0,
              href: "/search?type=b",
              selected: false,
            },
          ]}
        />
      </RouterProvider>,
    );
    expect(html).toContain("ds type-facet-bar");
    expect(html).toContain('aria-labelledby="type-facet-bar-label"');
    expect(html).toContain('class="value zero"');
  });
});
