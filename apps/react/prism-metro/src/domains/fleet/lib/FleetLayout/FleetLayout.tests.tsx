import { HomesProvider, setPrefetchEnvironment } from "@canonical/prism-core";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SERIES_90_CURIE } from "../../../../../testing/fixtures.js";
import renderMetroPage from "../../../../../testing/renderMetroPage.js";
import { homes } from "../../../../homes.js";
import { appRoutes, notFoundRoute } from "../../../../routes.js";
import FleetLayout from "./FleetLayout.js";

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

describe("FleetLayout", () => {
  it("lays the index out on the document archetype, with the fleet current", async () => {
    const { container } = renderMetroPage("/fleet");
    const root = container.querySelector(".ds.fleet-layout");
    expect(root).toHaveClass("document-layout");
    const rail = screen.getByRole("navigation", { name: "Primary" });
    expect(within(rail).getByRole("link", { name: "Fleet" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(root?.querySelector(".strip > .ds.mode-strip")).not.toBeNull();
    await screen.findByRole("heading", { level: 1, name: "Fleet" });
    expect(root?.querySelector(".aside")).toBeNull();
  });

  it("puts a node page's facts in the aside", async () => {
    const { container } = renderMetroPage(
      `/fleet/${encodeURIComponent(SERIES_90_CURIE)}`,
    );
    const facts = await screen.findByRole("region", { name: "Facts" });
    expect(container.querySelector(".aside")).toContainElement(facts);
  });

  it("names the page's address as the trail's current crumb", async () => {
    const { container } = renderMetroPage(
      `/fleet/${encodeURIComponent(SERIES_90_CURIE)}`,
    );
    await screen.findByRole("heading", { level: 1, name: "Series 90" });
    const trail = container.querySelector(".ds.mode-strip") as HTMLElement;
    expect(trail).toHaveTextContent(SERIES_90_CURIE);
    expect(within(trail).getByRole("link", { name: "Fleet" })).toHaveAttribute(
      "href",
      "/fleet",
    );
  });

  it("shows no facts off the lens's routes", () => {
    const { container } = render(
      <RouterProvider
        router={createRouter(appRoutes, {
          adapter: createMemoryAdapter("/nowhere"),
          notFound: notFoundRoute,
        })}
      >
        <HomesProvider homes={homes}>
          <FleetLayout className="x" data-testid="layout">
            <p>Page</p>
          </FleetLayout>
        </HomesProvider>
      </RouterProvider>,
    );
    expect(screen.getByTestId("layout")).toHaveClass("ds", "fleet-layout", "x");
    expect(container.querySelector(".aside")).toBeNull();
  });
});
