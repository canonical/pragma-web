import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { appRoutes, notFoundRoute } from "../../routes.js";
import SiteRail from "./SiteRail.js";

const renderSiteRail = () =>
  render(
    <RouterProvider
      router={createRouter(appRoutes, {
        adapter: createMemoryAdapter("/components"),
        notFound: notFoundRoute,
      })}
    >
      <SiteRail />
    </RouterProvider>,
  );

describe("SiteRail", () => {
  it("lists the lenses the router's table declares, in rail order", () => {
    renderSiteRail();
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(
      [...nav.querySelectorAll(".rail-lenses .rail-label")].map(
        (label) => label.textContent,
      ),
    ).toEqual([
      "Home",
      "Components",
      "Definitions",
      "Standards",
      "Journeys",
      "Guides",
    ]);
  });

  it("links the site brand to the home route", () => {
    renderSiteRail();
    const brand = screen
      .getByRole("navigation", { name: "Primary" })
      .querySelector(".rail-brand");
    expect(brand).toHaveAttribute("href", "/");
    expect(brand?.textContent).toBe("Pragmadesign system docs");
  });
});
