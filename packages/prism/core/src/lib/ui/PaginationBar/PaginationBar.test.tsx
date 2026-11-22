// Scaffolded by @canonical/summon-component:react v0.46.0

import {
  createMemoryAdapter,
  createRouter,
  route,
} from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import PaginationBar from "./PaginationBar.js";

const routes = { search: route({ url: "/search", content: () => null }) };

/** Render inside a router at the search page, where its links resolve. */
const renderRouted = (ui: ReactElement) =>
  render(
    <RouterProvider
      router={createRouter(routes, {
        adapter: createMemoryAdapter("/search?q=but"),
      })}
    >
      {ui}
    </RouterProvider>,
  );

describe("PaginationBar", () => {
  it("links both ends around the position in the middle of a set", () => {
    renderRouted(
      <PaginationBar
        label="21–40 of 61"
        nextHref="/search?q=but&page=3"
        previousHref="/search?q=but"
      />,
    );
    expect(screen.getByRole("navigation", { name: "Pages" })).toHaveTextContent(
      "21–40 of 61",
    );
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/search?q=but",
    );
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "/search?q=but&page=3",
    );
  });

  it("leaves out an end there is no page past", () => {
    renderRouted(
      <PaginationBar label="1–20 of 41" nextHref="/search?page=2" />,
    );
    expect(screen.queryByRole("link", { name: "Previous page" })).toBeNull();
    expect(screen.getByRole("link", { name: "Next page" })).toBeInTheDocument();
  });

  it("keeps a caller's class beside its own", () => {
    renderRouted(<PaginationBar className="foot" label="1–8 of 8" />);
    expect(screen.getByRole("navigation")).toHaveClass(
      "ds",
      "pagination-bar",
      "foot",
    );
  });
});
