// @vitest-environment node

/**
 * A site's server renders both of the lens's routes from the store their
 * warm filled, and nothing else: the markup carries the page in full, and
 * the render makes no request of its own.
 */

import { describe, expect, it } from "vitest";
import {
  ENTITY_TEST_TIMEOUT_MS,
  STATION_COUNT,
  STATIONS_BINDING,
} from "../../../testing/fixtures.js";
import renderServerMarkup from "../../../testing/renderServerMarkup.js";

const LAYOUT = { binding: STATIONS_BINDING, label: "Stations" } as const;

describe("server rendering", () => {
  it("renders the stations index, every row and the status, from its warm", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { html, requestsAfterWarm } = await renderServerMarkup(
      "/stations",
      LAYOUT,
    );

    expect(html.match(/class="ds node-row"/g)).toHaveLength(STATION_COUNT);
    expect(html).toContain('href="/stations/metro%3Anorthgate"');
    expect(html).toMatch(/data-slot="entity-status">16 of 16 entries</);
    expect(requestsAfterWarm).toBe(0);
  });

  it("renders a station's page, its fields table in full, from its warm", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { html, requestsAfterWarm } = await renderServerMarkup(
      "/stations/metro%3Anorthgate",
      LAYOUT,
    );

    expect(html).toContain('<h1 class="title">Northgate</h1>');
    expect(html).toContain('class="ds fields-table"');
    expect(html.match(/<tr class="field">/g)).toHaveLength(6);
    expect(html).toContain("<code>metro:servesLine</code>");
    expect(requestsAfterWarm).toBe(0);
  });
});
