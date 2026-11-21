// Scaffolded by @canonical/summon-component:react v0.46.0

import {
  createMemoryAdapter,
  createRouter,
  route,
} from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PaginationBar from "./PaginationBar.js";

const routes = { search: route({ url: "/search", content: () => null }) };

describe("PaginationBar SSR", () => {
  it("renders its links and position on the server", () => {
    const html = renderToString(
      <RouterProvider
        router={createRouter(routes, {
          adapter: createMemoryAdapter("/search?q=but"),
        })}
      >
        <PaginationBar label="1–20 of 41" nextHref="/search?q=but&page=2" />
      </RouterProvider>,
    );
    expect(html).toContain("ds pagination-bar");
    expect(html).toContain("1–20 of 41");
    expect(html).toContain('href="/search?q=but&amp;page=2"');
  });
});
