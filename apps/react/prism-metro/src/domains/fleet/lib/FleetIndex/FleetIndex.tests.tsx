import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { render, screen, within } from "@testing-library/react";
import { RelayEnvironmentProvider } from "react-relay";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ROLLING_STOCK_COUNT } from "../../../../../testing/fixtures.js";
import renderMetroPage from "../../../../../testing/renderMetroPage.js";
import FleetIndex from "./FleetIndex.js";

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

/** Render the index alone, over an environment answering with `response`. */
const renderWithAnswer = (response: Promise<unknown>) =>
  render(
    <RelayEnvironmentProvider
      environment={createEnvironment({
        fetchFn: vi.fn().mockReturnValue(response),
      })}
    >
      <FleetIndex />
    </RelayEnvironmentProvider>,
  );

describe("FleetIndex", () => {
  it("lists every rolling stock, each with its formations at one scale", async () => {
    const { container } = renderMetroPage("/fleet");
    const list = await screen
      .findByRole("list", { name: "" })
      .catch(() => container.querySelector('[data-placeholder="entity-list"]'));
    expect(list).toHaveAttribute("data-placeholder", "entity-list");
    const stocks = container.querySelectorAll(
      '.stock[data-placeholder="entity-card"]',
    );
    expect(stocks).toHaveLength(ROLLING_STOCK_COUNT);
    const series90 = [...stocks].find((stock) =>
      stock.textContent?.includes("Series 90 six-car"),
    ) as HTMLElement;
    const widths = [...series90.querySelectorAll("svg.drawing")].map((svg) =>
      svg.getAttribute("viewBox")?.split(" ").at(2),
    );
    expect(widths).toEqual(["120000", "120000"]);
    expect(
      within(series90).getByRole("link", { name: "Series 90" }),
    ).toHaveAttribute("href", "/fleet/metro%3Aseries-90");
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
