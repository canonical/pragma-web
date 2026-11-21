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

    expect(html.match(/class="ds entity-row ds node-row"/g)).toHaveLength(
      STATION_COUNT,
    );
    expect(html).toContain('href="/stations/metro%3Anorthgate"');
    expect(html).toMatch(
      /data-slot="entity-status"[^>]*><span class="full">16 of 16 entries<\/span><span class="short">16 entries</,
    );
    expect(requestsAfterWarm).toBe(0);
  });

  it("renders a station's page, its header and summary, from its warm", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { html, requestsAfterWarm } = await renderServerMarkup(
      "/stations/metro%3Anorthgate",
      LAYOUT,
    );

    expect(html).toMatch(
      /<h1 class="title"><svg[^>]*>.*?<\/svg>Northgate<\/h1>/,
    );
    expect(html).toContain('class="ds entity-summary');
    // A site that serves no statements shows no field list in their place.
    expect(html).not.toContain("field-list");
    expect(html).toContain(
      'data-canonical="https://metro.example/onto#northgate"',
    );
    expect(requestsAfterWarm).toBe(0);
  });
});
