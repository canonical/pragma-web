import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { appRoutes, notFoundRoute } from "../../../routes.js";
import MetroRail from "./MetroRail.js";
import type { MetroRailProps } from "./types.js";

const renderMetroRail = (props: MetroRailProps = {}) =>
  render(
    <RouterProvider
      router={createRouter(appRoutes, {
        adapter: createMemoryAdapter("/stations"),
        notFound: notFoundRoute,
      })}
    >
      <MetroRail {...props} />
    </RouterProvider>,
  );

describe("MetroRail", () => {
  it("lists Search, then the lenses the router's table declares, in rail order (W8-A1)", () => {
    renderMetroRail();
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(
      [...nav.querySelectorAll(".lenses .label")].map(
        (label) => label.textContent,
      ),
    ).toEqual([
      "Search",
      "Network",
      "Stations",
      "Lines",
      "Definitions",
      "Fleet",
    ]);
    expect(screen.getByRole("link", { name: "Search" })).toHaveAttribute(
      "href",
      "/search",
    );
  });

  it("leaves Search out when the table has no search route (W8-A1)", () => {
    const { search: _search, ...routes } = appRoutes;
    render(
      <RouterProvider
        router={createRouter(routes, {
          adapter: createMemoryAdapter("/stations"),
          notFound: notFoundRoute,
        })}
      >
        <MetroRail />
      </RouterProvider>,
    );
    expect(screen.queryByRole("link", { name: "Search" })).toBeNull();
  });

  it("links the site brand to the landing", () => {
    renderMetroRail();
    const brand = screen
      .getByRole("navigation", { name: "Primary" })
      .querySelector(".brand");
    expect(brand).toHaveAttribute("href", "/");
    expect(brand?.textContent).toBe("Metronetwork docs");
  });

  it("keeps the theme control in the utility cluster, out of the lens list", () => {
    renderMetroRail();
    const lenses = screen
      .getByRole("navigation", { name: "Primary" })
      .querySelector(".lenses");
    const utilities = screen.getByRole("list", { name: "Utilities" });
    const theme = screen.getByRole("combobox", { name: "Color theme" });
    expect(utilities.contains(theme)).toBe(true);
    expect(lenses?.contains(utilities)).toBe(false);
  });

  it("passes native props through to the rail's nav root", () => {
    renderMetroRail({ className: "is-pinned", id: "metro-rail" });
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(nav.id).toBe("metro-rail");
    expect(nav).toHaveClass("is-pinned");
  });
});
