import { setPrefetchEnvironment } from "@canonical/prism-core";
import { waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  CENTRAL_EXCHANGE_TITLE,
  CIRCLE_LINE_TITLE,
  INTERCHANGE_COUNT,
  LENS_PAGE_TEST_TIMEOUT_MS,
  LENS_PAGE_WAIT_MS,
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

/**
 * How long each wait below gives the page to answer: it mounts the whole
 * provider stack over a real socket, which overruns the default under
 * parallel machine load.
 */
const WAIT = { timeout: LENS_PAGE_WAIT_MS };

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

/** Read each fact of a card as its property, its label and its value. */
const readFacts = (card: Element): (string | null | undefined)[][] =>
  [...card.querySelectorAll(".fact")].map((fact) => [
    fact.getAttribute("data-property"),
    fact.querySelector(".term")?.textContent,
    fact.querySelector(".detail")?.textContent,
  ]);

describe("the stations lens's cards", {
  timeout: LENS_PAGE_TEST_TIMEOUT_MS,
}, () => {
  it("card every station as a station and every interchange as one", async () => {
    const { container } = renderLensPage("/stations?as=cards", graph.url);
    await waitFor(() => {
      expect(container.querySelectorAll(".ds.station-card")).toHaveLength(
        PLAIN_STATION_COUNT,
      );
    }, WAIT);
    expect(container.querySelectorAll(".ds.interchange-card")).toHaveLength(
      INTERCHANGE_COUNT,
    );
    expect(container.querySelector(".ds.node-card")).toBeNull();

    expect(readFacts(findCard(container, NORTHGATE_TITLE))).toEqual([
      ["platformCount", "Platforms", "4"],
      ["inZone", "Zone", ZONE_TITLE],
      ["servesLine", "Lines", "North Line"],
      ["location", "Location", "51.5412, -0.1435"],
    ]);
    expect(readFacts(findCard(container, CENTRAL_EXCHANGE_TITLE))).toEqual([
      ["platformCount", "Platforms", "8"],
      ["inZone", "Zone", ZONE_TITLE],
      ["servesLine", "Lines", "North Line, Circle Line, Coastal Line"],
      ["location", "Location", "51.5074, -0.1278"],
      ["transferMinutes", "Transfer", "4 minutes"],
    ]);
  });
});

describe("the lines lens's table", {
  timeout: LENS_PAGE_TEST_TIMEOUT_MS,
}, () => {
  it("tables every line, each naming its stops under its header", async () => {
    const { container } = renderLensPage("/lines", graph.url);
    await waitFor(() => {
      expect(
        container.querySelectorAll(".entity-table > tbody > tr"),
      ).toHaveLength(LINE_COUNT);
    }, WAIT);
    expect(container.querySelector(".node-row")).toBeNull();
    const circle = [
      ...container.querySelectorAll(".entity-table > tbody > tr"),
    ].find((row) => row.querySelector("th")?.textContent === CIRCLE_LINE_TITLE);
    // A list shows its first value and how many more: six stops.
    expect(
      circle?.querySelector('td.value[data-property="servedBy"] .detail')
        ?.textContent,
    ).toMatch(/^[^,]+ \+5$/);
    expect(
      container.querySelector('th.column[data-property="servedBy"] a.sort'),
    ).toHaveAttribute("href", "/lines?sort=servedBy");
  });
});

describe("a fare zone", { timeout: LENS_PAGE_TEST_TIMEOUT_MS }, () => {
  it("chips as a zone and, with no home, reads as text", async () => {
    const { container } = renderLensPage(
      `/definitions/${encodeURIComponent(ZONE_CLASS_CURIE)}`,
      graph.url,
    );
    await waitFor(() => {
      expect(
        container.querySelector(".term-inspector .zone-chip"),
      ).not.toBeNull();
    }, WAIT);
    const chips = [...container.querySelectorAll(".term-inspector .zone-chip")];
    expect(
      chips.map((chip) => chip.querySelector(".title")?.textContent),
    ).toContain(ZONE_TITLE);
    for (const chip of chips) {
      expect(chip.querySelector("a")).toBeNull();
      expect(chip.className).toBe("ds entity-chip ds zone-chip");
    }
  });
});
