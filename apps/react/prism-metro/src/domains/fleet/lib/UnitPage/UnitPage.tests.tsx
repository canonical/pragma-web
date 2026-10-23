import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { render, screen, within } from "@testing-library/react";
import { RelayEnvironmentProvider } from "react-relay";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SERIES_90_UNIT_CURIE } from "../../../../../testing/fixtures.js";
import renderMetroPage from "../../../../../testing/renderMetroPage.js";
import UnitPage from "./UnitPage.js";

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

/** The page's address in the fleet lens. */
const url = `/fleet/units/${encodeURIComponent(SERIES_90_UNIT_CURIE)}`;

/** Render the page alone, over an environment answering with `response`. */
const renderWithAnswer = (response: Promise<unknown>) =>
  render(
    <RelayEnvironmentProvider
      environment={createEnvironment({
        fetchFn: vi.fn().mockReturnValue(response),
      })}
    >
      <UnitPage address={SERIES_90_UNIT_CURIE} />
    </RelayEnvironmentProvider>,
  );

describe("UnitPage", () => {
  it("titles the page and the document with the node's title", async () => {
    renderMetroPage(url);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Series 90 unit" }),
    ).toBeInTheDocument();
  });

  it("draws the unit as a train of its own", async () => {
    const { container } = renderMetroPage(url);
    await screen.findByRole("heading", { level: 1, name: "Series 90 unit" });
    expect(container.querySelectorAll("article path.car")).toHaveLength(3);
  });

  it("lists its facts in the aside", async () => {
    renderMetroPage(url);
    const facts = await screen.findByRole("region", { name: "Facts" });
    await within(facts).findByText("Cars");
    expect(facts).toHaveTextContent("60 m");
  });

  it("says nothing of its type lives at an address that names none", async () => {
    renderMetroPage(`/fleet/units/${encodeURIComponent("metro:northgate")}`);
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
    expect(article).toHaveClass("ds", "unit-page");
  });
});
