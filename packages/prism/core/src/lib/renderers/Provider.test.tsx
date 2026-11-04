import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { LENS_ROUTES } from "../../../testing/fixtures.js";
import useRenderers from "./hooks/useRenderers.js";
import RenderersProvider from "./Provider.js";
import type { RendererDefaults } from "./types.js";

const DEFAULTS: RendererDefaults = {
  list: [{ name: "table", label: "Table", render: () => null }],
  page: [
    { name: "page", label: "Page", render: ({ children }) => children },
    {
      name: "turtle",
      label: "Turtle",
      render: () => null,
      offered: ({ extensions }) => extensions.has("source"),
    },
  ],
};

/** Prints the page renderers the provider offers. */
const PageRenderers = (): ReactElement => (
  <p>
    {useRenderers("page")
      .offered.map(({ label }) => label)
      .join(" | ")}
  </p>
);

describe("RenderersProvider", () => {
  it("offers the site's renderers the provider serves the facts for", () => {
    render(
      <RouterProvider
        router={createRouter(LENS_ROUTES, {
          adapter: createMemoryAdapter("/"),
        })}
      >
        <RenderersProvider defaults={DEFAULTS} extensions={["source"]}>
          <PageRenderers />
        </RenderersProvider>
      </RouterProvider>,
    );
    expect(screen.getByText("Page | Turtle")).toBeInTheDocument();
  });

  it("leaves out a renderer whose extension the provider does not serve", () => {
    render(
      <RouterProvider
        router={createRouter(LENS_ROUTES, {
          adapter: createMemoryAdapter("/"),
        })}
      >
        <RenderersProvider defaults={DEFAULTS} extensions={["prose"]}>
          <PageRenderers />
        </RenderersProvider>
      </RouterProvider>,
    );
    expect(screen.getByText("Page")).toBeInTheDocument();
  });
});
