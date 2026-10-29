import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { render, screen, within } from "@testing-library/react";
import { RelayEnvironmentProvider } from "react-relay";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SERIES_90_DRIVING_CURIE } from "../../../../../testing/fixtures.js";
import renderMetroPage from "../../../../../testing/renderMetroPage.js";
import CarTypePage from "./CarTypePage.js";

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

/** The page's address in the fleet lens. */
const url = `/fleet/car-types/${encodeURIComponent(SERIES_90_DRIVING_CURIE)}`;

/** Render the page alone, over an environment answering with `response`. */
const renderWithAnswer = (response: Promise<unknown>) =>
  render(
    <RelayEnvironmentProvider
      environment={createEnvironment({
        fetchFn: vi.fn().mockReturnValue(response),
      })}
    >
      <CarTypePage address={SERIES_90_DRIVING_CURIE} />
    </RelayEnvironmentProvider>,
  );

describe("CarTypePage", () => {
  it("titles the page and the document with the node's title", async () => {
    renderMetroPage(url);
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Series 90 driving motor car",
      }),
    ).toBeInTheDocument();
  });

  it("draws the car alone, its cab at the front", async () => {
    const { container } = renderMetroPage(url);
    await screen.findByRole("heading", {
      level: 1,
      name: "Series 90 driving motor car",
    });
    const car = container.querySelector("article path.car");
    expect(car?.getAttribute("d")).toMatch(/^M0 /);
  });

  it("lists its code, its cab and its measures in the aside", async () => {
    renderMetroPage(url);
    const facts = await screen.findByRole("region", { name: "Facts" });
    await within(facts).findByText("Driving cab");
    expect(facts).toHaveTextContent("DM");
    expect(facts).toHaveTextContent("Yes");
    expect(facts).toHaveTextContent("20 m");
  });

  it("says a car type without a cab has none", async () => {
    renderMetroPage(
      `/fleet/car-types/${encodeURIComponent("metro:car-90-trailer")}`,
    );
    const facts = await screen.findByRole("region", { name: "Facts" });
    await within(facts).findByText("Driving cab");
    expect(facts).toHaveTextContent("No");
  });

  it("says nothing of its type lives at an address that names none", async () => {
    renderMetroPage(
      `/fleet/car-types/${encodeURIComponent("metro:northgate")}`,
    );
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
    expect(article).toHaveClass("ds", "car-type-page");
  });
});
