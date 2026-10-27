import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { render, screen, within } from "@testing-library/react";
import { RelayEnvironmentProvider } from "react-relay";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SERIES_90_SIX_CAR_CURIE } from "../../../../../testing/fixtures.js";
import renderMetroPage from "../../../../../testing/renderMetroPage.js";
import FormationPage from "./FormationPage.js";

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

/** The page's address in the fleet lens. */
const url = `/fleet/formations/${encodeURIComponent(SERIES_90_SIX_CAR_CURIE)}`;

/** Render the page alone, over an environment answering with `response`. */
const renderWithAnswer = (response: Promise<unknown>) =>
  render(
    <RelayEnvironmentProvider
      environment={createEnvironment({
        fetchFn: vi.fn().mockReturnValue(response),
      })}
    >
      <FormationPage address={SERIES_90_SIX_CAR_CURIE} />
    </RelayEnvironmentProvider>,
  );

describe("FormationPage", () => {
  it("titles the page and the document with the node's title", async () => {
    renderMetroPage(url);
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Series 90 six-car",
      }),
    ).toBeInTheDocument();
  });

  it("names its stock, linked to its page", async () => {
    renderMetroPage(url);
    await screen.findByRole("heading", { level: 1, name: "Series 90 six-car" });
    expect(screen.getByRole("link", { name: "Series 90" })).toHaveAttribute(
      "href",
      "/fleet/metro%3Aseries-90",
    );
  });

  it("marks the shortest platform and the overhang in its side view", async () => {
    const { container } = renderMetroPage(url);
    await screen.findByRole("heading", { level: 1, name: "Series 90 six-car" });
    const drawing = container.querySelector("article svg.drawing");
    expect(drawing?.querySelector("line.overhang")).toHaveAttribute(
      "x1",
      "100000",
    );
  });

  it("lists its units in order, each linked to its page", async () => {
    renderMetroPage(url);
    const section = await screen.findByRole("region", { name: "Units" });
    const links = within(section).getAllByRole("link", {
      name: "Series 90 unit",
    });
    expect(links).toHaveLength(2);
    expect(links.at(0)).toHaveAttribute("href", "/fleet/units/metro%3Aunit-90");
  });

  it("marks a reversed unit as such", async () => {
    renderMetroPage(
      `/fleet/formations/${encodeURIComponent("metro:series-50-four-car")}`,
    );
    const section = await screen.findByRole("region", { name: "Units" });
    const entries = within(section).getAllByRole("listitem");
    expect(
      entries.map((entry) => entry.textContent?.includes("reversed")),
    ).toEqual([false, true]);
  });

  it("reports its fit at the platforms of each line", async () => {
    renderMetroPage(url);
    const section = await screen.findByRole("region", { name: "Platform fit" });
    expect(section).toHaveTextContent(
      "Marsh End: 20 m past its 100 m platform",
    );
  });

  it("lists its facts in the aside", async () => {
    renderMetroPage(url);
    const facts = await screen.findByRole("region", { name: "Facts" });
    await within(facts).findByText("Units");
    expect(facts).toHaveTextContent("120 m");
    expect(facts).toHaveTextContent("980 passengers");
  });

  it("says nothing of its type lives at an address that names none", async () => {
    renderMetroPage(
      `/fleet/formations/${encodeURIComponent("metro:northgate")}`,
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
    expect(article).toHaveClass("ds", "formation-page");
  });
});
