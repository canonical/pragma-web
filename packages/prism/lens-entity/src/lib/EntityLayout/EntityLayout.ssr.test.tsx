import { createEnvironment } from "@canonical/prism-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createEntitySite from "../../../testing/createEntitySite.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import createWarmEnvironment from "../../../testing/createWarmEnvironment.js";
import {
  ENTITY_TEST_TIMEOUT_MS,
  STATIONS_BINDING,
} from "../../../testing/fixtures.js";

/** The layout the stations lens's site wrapper mounts. */
const STATIONS_LAYOUT = {
  binding: STATIONS_BINDING,
  label: "Stations",
  rail: <nav aria-label="Site rail" />,
  colophon: <footer>Colophon</footer>,
} as const;

describe("EntityLayout on the server", () => {
  it("renders the rail, the claimed strip, the canvas and the colophon from a warm store", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { environment, fetchFn } = await createWarmEnvironment("/stations");
    const html = renderToString(
      createEntitySite({
        url: "/stations",
        environment,
        layout: STATIONS_LAYOUT,
      }),
    );

    expect(html).toContain('class="ds entity-layout"');
    expect(html).toContain('aria-label="Site rail"');
    expect(html).toContain('data-slot="entity-controls"');
    // React separates adjacent text nodes with `<!-- -->` markers.
    expect(html).toMatch(/data-slot="entity-status">16 of 16 entries</);
    expect(html).toContain('class="ds entity-index-page"');
    expect(html).toContain("<footer>Colophon</footer>");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("keeps the layout standing with an empty status over a cold store", () => {
    const html = renderToString(
      createEntitySite({
        url: "/stations",
        environment: createEnvironment({ fetchFn: createFetchSpy() }),
        layout: STATIONS_LAYOUT,
      }),
    );

    expect(html).toContain('aria-label="Site rail"');
    expect(html).toContain('class="ds entity-index-page"');
    expect(html).not.toContain('data-slot="entity-status"');
  });
});
