import { setPrefetchEnvironment } from "@canonical/prism-core";
import { screen, waitFor, within } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  CIRCLE_LINE_TITLE,
  LINE_COUNT,
  NORTHGATE_TITLE,
  STATION_COUNT,
} from "../../../testing/fixtures.js";
import renderLensPage from "../../../testing/renderLensPage.js";
import startMetroGraph from "../../../testing/startMetroGraph.js";
import type { MetroGraph } from "../../../testing/types.js";

// The three lenses render with data from the metro provider, over a real
// socket: the entity lens bound to stations and to lines, and the
// Definitions lens over the metro ontology.

let graph: MetroGraph;

beforeAll(async () => {
  graph = await startMetroGraph();
});

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

afterAll(() => graph.close());

/** The rows of the entity index once its query has answered. */
const findIndexRows = async (): Promise<HTMLElement[]> => {
  const canvas = await screen.findByRole("main");
  await waitFor(() => {
    expect(canvas.querySelector(".entity-index .rows")).not.toBeNull();
  });
  return within(canvas).getAllByRole("listitem");
};

describe("the stations lens", () => {
  it("lists every instance of the station class", async () => {
    renderLensPage("/stations", graph.url);
    expect(await findIndexRows()).toHaveLength(STATION_COUNT);
    expect(screen.getByRole("link", { name: NORTHGATE_TITLE })).toHaveAttribute(
      "href",
      "/stations/metro%3Anorthgate",
    );
  });

  it("shows a station's page with the fields its class declares", async () => {
    renderLensPage("/stations/metro%3Anorthgate", graph.url);
    expect(
      await screen.findByRole("heading", { level: 1, name: NORTHGATE_TITLE }),
    ).toBeInTheDocument();
    const fields = await screen.findByRole("table");
    expect(within(fields).getByText("servesLine")).toBeInTheDocument();
  });
});

describe("the lines lens", () => {
  it("lists every line of the network", async () => {
    renderLensPage("/lines", graph.url);
    expect(await findIndexRows()).toHaveLength(LINE_COUNT);
    expect(
      screen.getByRole("link", { name: CIRCLE_LINE_TITLE }),
    ).toHaveAttribute("href", "/lines/metro%3Acircle-line");
  });
});

describe("the Definitions lens", () => {
  it("inspects the station class, with its instances linked to the stations lens", async () => {
    const { container } = renderLensPage(
      "/definitions/metro%3AStation",
      graph.url,
    );
    await waitFor(() => {
      expect(
        container.querySelector(".term-inspector .node-chip a"),
      ).not.toBeNull();
    });
    const chips = [
      ...container.querySelectorAll<HTMLAnchorElement>(
        ".term-inspector .node-chip a",
      ),
    ];
    expect(chips.length).toBeGreaterThan(0);
    for (const chip of chips) {
      expect(chip.getAttribute("href")).toMatch(/^\/stations\/metro%3A[\w-]*$/);
    }
    // The inspector shows the first page of instances in IRI order, which
    // Central Exchange is on and Northgate, past the first page, is not.
    expect(
      chips.some(
        (chip) =>
          chip.getAttribute("href") === "/stations/metro%3Acentral-exchange",
      ),
    ).toBe(true);
  });
});
