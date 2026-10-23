import { setPrefetchEnvironment } from "@canonical/prism-core";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  CENTRAL_EXCHANGE_TITLE,
  INTERCHANGE_COUNT,
  LINE_COUNT,
  STATION_COUNT,
  ZONE_CLASS_CURIE,
  ZONE_TITLE,
} from "../../../testing/fixtures.js";
import renderLensPage from "../../../testing/renderLensPage.js";
import startMetroGraph from "../../../testing/startMetroGraph.js";
import type { MetroGraph } from "../../../testing/types.js";

// The site's own arms render the metro types the lenses list, and every
// other type keeps the default `Node` arm.

let graph: MetroGraph;

beforeAll(async () => {
  graph = await startMetroGraph();
});

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

afterAll(() => graph.close());

describe("the station card", () => {
  it("cards every station, and marks the interchanges", async () => {
    const { container } = renderLensPage("/stations", graph.url);
    fireEvent.click(await screen.findByRole("button", { name: "Cards" }));
    await waitFor(() => {
      expect(container.querySelectorAll(".ds.station-card")).toHaveLength(
        STATION_COUNT,
      );
    });
    expect(
      container.querySelectorAll(".ds.station-card.interchange"),
    ).toHaveLength(INTERCHANGE_COUNT);
    expect(
      container.querySelector(".ds.station-card.interchange h3")?.textContent,
    ).toBe(CENTRAL_EXCHANGE_TITLE);
  });
});

describe("the line row", () => {
  it("rows every line", async () => {
    const { container } = renderLensPage("/lines", graph.url);
    await waitFor(() => {
      expect(container.querySelectorAll("li.line-row")).toHaveLength(
        LINE_COUNT,
      );
    });
    expect(
      container.querySelectorAll("li.node-row:not(.line-row)"),
    ).toHaveLength(0);
  });
});

describe("a fare zone", () => {
  it("keeps the Node arm and, with no home, reads as text", async () => {
    const { container } = renderLensPage(
      `/definitions/${encodeURIComponent(ZONE_CLASS_CURIE)}`,
      graph.url,
    );
    await waitFor(() => {
      expect(
        container.querySelector(".term-inspector .node-chip"),
      ).not.toBeNull();
    });
    const chips = [...container.querySelectorAll(".term-inspector .node-chip")];
    expect(chips.map((chip) => chip.textContent)).toContain(ZONE_TITLE);
    for (const chip of chips) {
      expect(chip.querySelector("a")).toBeNull();
      expect(chip.className).toBe("ds entity-chip ds node-chip");
    }
  });
});
