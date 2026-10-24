import { setPrefetchEnvironment } from "@canonical/prism-core";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  CENTRAL_EXCHANGE_TITLE,
  CIRCLE_LINE_TITLE,
  INTERCHANGE_COUNT,
  LINE_COUNT,
  NORTHGATE_TITLE,
  PLAIN_STATION_COUNT,
  ZONE_CLASS_CURIE,
  ZONE_TITLE,
} from "../../../testing/fixtures.js";
import renderLensPage from "../../../testing/renderLensPage.js";
import startMetroGraph from "../../../testing/startMetroGraph.js";
import type { MetroGraph } from "../../../testing/types.js";

// The site's own projections render the metro types the lenses list, read
// through the package's dispatchers on the app's own Relay compile, and
// every other type keeps the package's arms.

let graph: MetroGraph;

beforeAll(async () => {
  graph = await startMetroGraph();
});

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

afterAll(() => graph.close());

/** Find the card whose title reads `title`. */
const findCard = (container: HTMLElement, title: string): Element => {
  const card = [...container.querySelectorAll(".ds.entity-card")].find(
    (candidate) => candidate.querySelector(".title")?.textContent === title,
  );
  if (card === undefined) {
    throw new Error(`no card is titled ${title}`);
  }
  return card;
};

/** Read each key value of a card as its key and its value's text. */
const readPairs = (card: Element): (string | null)[][] =>
  [...card.querySelectorAll(".pair")].map((pair) => [
    pair.querySelector(".key")?.textContent ?? null,
    pair.querySelector(".value")?.textContent ?? null,
  ]);

/** Read a card's vitals. */
const readVitals = (card: Element): (string | null)[] =>
  [...card.querySelectorAll(".vital")].map((vital) => vital.textContent);

describe("the stations lens's cards", () => {
  it("card every station as a station and every interchange as one", async () => {
    const { container } = renderLensPage("/stations", graph.url);
    fireEvent.click(await screen.findByRole("button", { name: "Cards" }));
    await waitFor(() => {
      expect(container.querySelectorAll(".ds.station-card")).toHaveLength(
        PLAIN_STATION_COUNT,
      );
    });
    expect(container.querySelectorAll(".ds.interchange-card")).toHaveLength(
      INTERCHANGE_COUNT,
    );
    expect(container.querySelector(".ds.node-card")).toBeNull();

    expect(readPairs(findCard(container, NORTHGATE_TITLE))).toEqual([
      ["Platforms", "4"],
      ["Zone", ZONE_TITLE],
      ["Lines", "North Line"],
    ]);
    const exchange = findCard(container, CENTRAL_EXCHANGE_TITLE);
    expect(readPairs(exchange)).toContainEqual(["Transfer", "4 minutes"]);
    expect(readVitals(exchange)).toEqual(["8 platforms", "3 lines"]);
  });
});

describe("the lines lens's rows", () => {
  it("row every line as a line, each ending in its stops", async () => {
    const { container } = renderLensPage("/lines", graph.url);
    await waitFor(() => {
      expect(container.querySelectorAll("li.line-row")).toHaveLength(
        LINE_COUNT,
      );
    });
    expect(container.querySelector(".node-row")).toBeNull();
    const circle = [...container.querySelectorAll("li.line-row")].find(
      (row) => row.querySelector(".title")?.textContent === CIRCLE_LINE_TITLE,
    );
    expect(circle?.querySelector(".meta")?.textContent).toBe("6 stops");
  });
});

describe("a fare zone", () => {
  it("chips as a zone and, with no home, reads as text", async () => {
    const { container } = renderLensPage(
      `/definitions/${encodeURIComponent(ZONE_CLASS_CURIE)}`,
      graph.url,
    );
    await waitFor(() => {
      expect(
        container.querySelector(".term-inspector .zone-chip"),
      ).not.toBeNull();
    });
    const chips = [...container.querySelectorAll(".term-inspector .zone-chip")];
    expect(chips.map((chip) => chip.textContent)).toContain(ZONE_TITLE);
    for (const chip of chips) {
      expect(chip.querySelector("a")).toBeNull();
      expect(chip.className).toBe("ds entity-chip ds zone-chip");
    }
  });
});
