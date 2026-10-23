import { HomesProvider } from "@canonical/prism-core";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { homes } from "../../../../homes.js";
import { appRoutes } from "../../../../routes.js";
import NodeLink from "./NodeLink.js";

/** Render `element` under the site's router and homes. */
const renderInSite = (element: ReactElement) =>
  render(
    <RouterProvider
      router={createRouter(appRoutes, {
        adapter: createMemoryAdapter("/fleet"),
      })}
    >
      <HomesProvider homes={homes}>{element}</HomesProvider>
    </RouterProvider>,
  );

describe("NodeLink", () => {
  it("links a node with a home to its page", () => {
    renderInSite(
      <NodeLink address="metro:series-90" typename="RollingStock">
        Series 90
      </NodeLink>,
    );
    expect(screen.getByRole("link", { name: "Series 90" })).toHaveAttribute(
      "href",
      "/fleet/metro%3Aseries-90",
    );
  });

  it("names a node with no home as plain text", () => {
    renderInSite(
      <NodeLink address="geo:central-zone" typename="Zone">
        Central Zone
      </NodeLink>,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Central Zone")).toHaveClass("ds", "node-link");
  });
});
