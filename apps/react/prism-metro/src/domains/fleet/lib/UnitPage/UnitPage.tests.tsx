import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SERIES_90_UNIT_CURIE } from "../../../../../testing/fixtures.js";
import renderMetroPage from "../../../../../testing/renderMetroPage.js";
import renderWithSite from "../../../../../testing/renderWithSite.js";
import UnitPage from "./UnitPage.js";

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

/** The page's address in the fleet lens. */
const url = `/fleet/units/${encodeURIComponent(SERIES_90_UNIT_CURIE)}`;

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
    <UnitPage address={SERIES_90_UNIT_CURIE} />,
    "/fleet",
    createEnvironment({ fetchFn: vi.fn().mockReturnValue(response) }),
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

  it("lists its facts beside its sections, under no heading", async () => {
    const { container } = renderMetroPage(url);
    const facts = await findFacts(container);
    expect(screen.queryByRole("heading", { name: "Facts" })).toBeNull();
    await within(facts).findByText("Cars");
    expect(facts).toHaveTextContent("60 m");
  });

  it("shows its side view as its one section, with no index", async () => {
    const { container } = renderMetroPage(url);
    const section = await screen.findByRole("region", { name: "Side view" });
    expect(section.querySelectorAll("path.car")).toHaveLength(3);
    expect(container.querySelector(".ds.sectioned-view .contents")).toBeNull();
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
