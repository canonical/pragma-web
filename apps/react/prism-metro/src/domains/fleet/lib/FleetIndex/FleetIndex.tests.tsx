import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { RelayEnvironmentProvider } from "react-relay";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ROLLING_STOCK_COUNT } from "../../../../../testing/fixtures.js";
import renderMetroPage from "../../../../../testing/renderMetroPage.js";
import { appRoutes } from "../../../../routes.js";
import FleetIndex from "./FleetIndex.js";

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

/**
 * Render the index alone at `/fleet`, over an environment answering with
 * `response`.
 */
const renderWithAnswer = (response: Promise<unknown>) =>
  render(
    <RelayEnvironmentProvider
      environment={createEnvironment({
        fetchFn: vi.fn().mockReturnValue(response),
      })}
    >
      <RouterProvider
        router={createRouter(appRoutes, {
          adapter: createMemoryAdapter("/fleet"),
        })}
      >
        <FleetIndex />
      </RouterProvider>
    </RelayEnvironmentProvider>,
  );

describe("FleetIndex", () => {
  it("lists every rolling stock as a card, its formations at one scale", async () => {
    const { container } = renderMetroPage("/fleet");
    const cards = await waitFor(() => {
      const found = container.querySelectorAll(
        ".ds.node-list .rolling-stock-card",
      );
      expect(found).toHaveLength(ROLLING_STOCK_COUNT);
      return [...found];
    });
    const series90 = cards.find((card) =>
      card.textContent?.includes("Series 90"),
    ) as HTMLElement;
    const widths = [...series90.querySelectorAll(".sidecar svg.drawing")].map(
      (svg) => svg.getAttribute("viewBox")?.split(" ").at(2),
    );
    expect(widths).toEqual(["120000", "120000"]);
    expect(
      within(series90).getByRole("link", { name: "Series 90" }),
    ).toHaveAttribute("href", "/fleet/metro%3Aseries-90");
    expect(container.querySelector(".ds.node-list .count")).toHaveTextContent(
      `${ROLLING_STOCK_COUNT} rolling stocks`,
    );
  });

  it("lists the rolling stock as rows when the address asks for them", async () => {
    const { container } = renderMetroPage("/fleet?view=rows");
    await waitFor(() => {
      expect(
        container.querySelectorAll(".ds.node-list .rolling-stock-row"),
      ).toHaveLength(ROLLING_STOCK_COUNT);
    });
    expect(container.querySelector(".rolling-stock-card")).toBeNull();
  });

  it("switches to rows when the reader picks them", async () => {
    const { container } = renderMetroPage("/fleet");
    await screen.findByRole("link", { name: "Series 90" });
    fireEvent.click(screen.getByRole("button", { name: "Rows" }));
    await waitFor(() => {
      expect(container.querySelector(".rolling-stock-row")).not.toBeNull();
    });
  });

  it("says so while the fleet is on its way", () => {
    renderWithAnswer(new Promise(() => {}));
    expect(screen.getByText("Loading the fleet…")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Fleet" }),
    ).toBeInTheDocument();
  });

  it("says so when the graph lists no rolling stock", async () => {
    renderWithAnswer(
      Promise.resolve({
        data: {
          ontologyClass: {
            uri: "metro:RollingStock",
            instances: { edges: [] },
          },
        },
      }),
    );
    expect(
      await screen.findByText("The graph lists no rolling stock."),
    ).toBeInTheDocument();
  });

  it("says so when the graph has no rolling stock class", async () => {
    renderWithAnswer(Promise.resolve({ data: { ontologyClass: null } }));
    expect(
      await screen.findByText("The graph lists no rolling stock."),
    ).toBeInTheDocument();
  });

  it("leaves out an instance of another type", async () => {
    renderWithAnswer(
      Promise.resolve({
        data: {
          ontologyClass: {
            uri: "metro:RollingStock",
            instances: {
              edges: [
                {
                  node: {
                    __typename: "Station",
                    __isNode: "Station",
                    uri: "https://metro.example/onto#northgate",
                  },
                },
              ],
            },
          },
        },
      }),
    );
    expect(
      await screen.findByText("The graph lists no rolling stock."),
    ).toBeInTheDocument();
  });

  it("raises an alert when the fleet cannot be read", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderWithAnswer(Promise.reject(new Error("graph down")));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The fleet could not be loaded.",
    );
  });

  it("passes native props to its article and merges its class", () => {
    renderWithAnswer(new Promise(() => {}));
    const article = screen.getByRole("article");
    expect(article).toHaveClass("ds", "fleet-index");
  });
});
