import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { render, screen, waitFor, within } from "@testing-library/react";
import { RelayEnvironmentProvider } from "react-relay";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SERIES_90_CURIE } from "../../../../../testing/fixtures.js";
import renderMetroPage from "../../../../../testing/renderMetroPage.js";
import StockPage from "./StockPage.js";

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

/** The page's address in the fleet lens. */
const url = `/fleet/${encodeURIComponent(SERIES_90_CURIE)}`;

/** Render the page alone, over an environment answering with `response`. */
const renderWithAnswer = (response: Promise<unknown>) =>
  render(
    <RelayEnvironmentProvider
      environment={createEnvironment({
        fetchFn: vi.fn().mockReturnValue(response),
      })}
    >
      <StockPage address={SERIES_90_CURIE} />
    </RelayEnvironmentProvider>,
  );

describe("StockPage", () => {
  it("titles the page and the document with the node's title", async () => {
    renderMetroPage(url);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Series 90" }),
    ).toBeInTheDocument();
  });

  it("draws its formations at one scale, each linked to its page", async () => {
    const { container } = renderMetroPage(url);
    await screen.findByRole("heading", { level: 1, name: "Series 90" });
    const drawings = [...container.querySelectorAll("article svg.drawing")];
    expect(
      drawings.map((svg) => svg.getAttribute("viewBox")?.split(" ").at(2)),
    ).toEqual(["120000", "120000"]);
    expect(
      screen.getByRole("link", { name: "Series 90 six-car" }),
    ).toHaveAttribute("href", "/fleet/formations/metro%3Aseries-90-six-car");
  });

  it("lists each car type once, as its row, linked to its page", async () => {
    renderMetroPage(url);
    const section = await screen.findByRole("region", { name: "Car types" });
    const rows = await waitFor(() => {
      const found = section.querySelectorAll(".ds.car-type-row");
      expect(found).toHaveLength(2);
      return [...found];
    });
    expect(rows.map((row) => row.querySelector(".title")?.textContent)).toEqual(
      ["Series 90 driving motor car", "Series 90 trailer car"],
    );
    expect(
      within(section).getByRole("link", { name: "Series 90 trailer car" }),
    ).toHaveAttribute("href", "/fleet/car-types/metro%3Acar-90-trailer");
  });

  it("lists its facts in the aside: formations and the ranges", async () => {
    renderMetroPage(url);
    const facts = await screen.findByRole("region", { name: "Facts" });
    await within(facts).findByText("Formations");
    expect(facts).toHaveTextContent("60 m to 120 m");
    expect(facts).toHaveTextContent("490 passengers to 980 passengers");
  });

  it("reads one formation's measures as single values", async () => {
    renderMetroPage(`/fleet/${encodeURIComponent("metro:series-70")}`);
    const facts = await screen.findByRole("region", { name: "Facts" });
    await within(facts).findByText("Formations");
    expect(facts).toHaveTextContent("107.2 m");
    expect(facts).not.toHaveTextContent(" to ");
  });

  it("says nothing of its type lives at an address that names none", async () => {
    renderMetroPage(`/fleet/${encodeURIComponent("metro:northgate")}`);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Nothing in the fleet lives at metro:northgate.",
    );
  });

  it("says so while its data is on its way", () => {
    renderWithAnswer(new Promise(() => {}));
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("raises an alert when its data cannot be read", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderWithAnswer(Promise.reject(new Error("graph down")));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This page could not be loaded.",
    );
  });

  it("passes native props to its article and merges its class", () => {
    renderWithAnswer(new Promise(() => {}));
    const article = screen.getByRole("article");
    expect(article).toHaveClass("ds", "stock-page");
  });
});
