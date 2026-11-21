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
import TypeFacetBar from "./TypeFacetBar.js";
import type { TypeFacetValue } from "./types.js";

const routes = { search: route({ url: "/search", content: () => null }) };

const FACETS: readonly TypeFacetValue[] = [
  {
    id: "ex:Station",
    label: "Station",
    count: 6,
    href: "/search?q=n&type=s",
    selected: true,
  },
  {
    id: "ex:Line",
    label: "Line",
    count: 2,
    href: "/search?q=n&type=l",
    selected: false,
  },
  {
    id: "ex:Zone",
    label: "Zone",
    count: 0,
    href: "/search?q=n&type=z",
    selected: false,
  },
];

/** Render inside a router at the search page, where its links resolve. */
const renderRouted = (ui: ReactElement) =>
  render(
    <RouterProvider
      router={createRouter(routes, {
        adapter: createMemoryAdapter("/search?q=n"),
      })}
    >
      {ui}
    </RouterProvider>,
  );

describe("TypeFacetBar", () => {
  it("names itself Type and links each type with results to its address", () => {
    renderRouted(<TypeFacetBar facets={FACETS} />);
    expect(
      screen.getByRole("navigation", { name: "Type" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Line 2" })).toHaveAttribute(
      "href",
      "/search?q=n&type=l",
    );
  });

  it("marks the applied type current", () => {
    renderRouted(<TypeFacetBar facets={FACETS} />);
    expect(screen.getByRole("link", { name: "Station 6" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "Line 2" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("greys a type with no results and offers no link to it", () => {
    renderRouted(<TypeFacetBar facets={FACETS} />);
    expect(screen.queryByRole("link", { name: /Zone/ })).toBeNull();
    expect(screen.getByText("Zone").closest("li")).toHaveClass("value", "zero");
  });

  it("takes a caller's name for the facet", () => {
    renderRouted(<TypeFacetBar facets={FACETS} label="Kind" />);
    expect(
      screen.getByRole("navigation", { name: "Kind" }),
    ).toBeInTheDocument();
  });
});
