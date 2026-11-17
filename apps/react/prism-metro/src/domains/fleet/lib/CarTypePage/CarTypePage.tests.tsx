import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SERIES_90_DRIVING_CURIE } from "../../../../../testing/fixtures.js";
import renderMetroPage from "../../../../../testing/renderMetroPage.js";
import renderWithSite from "../../../../../testing/renderWithSite.js";
import CarTypePage from "./CarTypePage.js";

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

/** The page's address in the fleet lens. */
const url = `/fleet/car-types/${encodeURIComponent(SERIES_90_DRIVING_CURIE)}`;

/**
 * Find the sectioned view's facts block once the page's data is in, the
 * view's own region beside the sections, under no heading of its own.
 */
const findFacts = (container: HTMLElement): Promise<HTMLElement> =>
  waitFor(() => {
    const facts = container.querySelector<HTMLElement>(
      ".ds.sectioned-view .facts",
    );
    expect(facts).not.toBeNull();
    return facts as HTMLElement;
  });

/** Render the page alone, over an environment answering with `response`. */
const renderWithAnswer = (response: Promise<unknown>) =>
  renderWithSite(
    <CarTypePage address={SERIES_90_DRIVING_CURIE} />,
    "/fleet",
    createEnvironment({ fetchFn: vi.fn().mockReturnValue(response) }),
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

  it("lists its code, its cab and its measures beside its sections", async () => {
    const { container } = renderMetroPage(url);
    const facts = await findFacts(container);
    expect(screen.queryByRole("heading", { name: "Facts" })).toBeNull();
    await within(facts).findByText("Driving cab");
    expect(facts).toHaveTextContent("DM");
    expect(facts).toHaveTextContent("Yes");
    expect(facts).toHaveTextContent("20 m");
  });

  it("says a car type without a cab has none", async () => {
    const { container } = renderMetroPage(
      `/fleet/car-types/${encodeURIComponent("metro:car-90-trailer")}`,
    );
    const facts = await findFacts(container);
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
