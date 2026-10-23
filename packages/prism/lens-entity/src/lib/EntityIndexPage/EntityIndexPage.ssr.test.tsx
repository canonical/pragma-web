import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createEntitySite from "../../../testing/createEntitySite.js";
import createWarmEnvironment from "../../../testing/createWarmEnvironment.js";
import {
  ENTITY_TEST_TIMEOUT_MS,
  STATION_COUNT,
} from "../../../testing/fixtures.js";

describe("EntityIndexPage on the server", () => {
  it("renders the heading and every row from the warm store, with no request", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { environment, fetchFn } = await createWarmEnvironment("/stations");
    const html = renderToString(
      createEntitySite({ url: "/stations", environment }),
    );

    expect(html).toContain('class="ds entity-index-page"');
    expect(html).toMatch(/<h1 class="heading" id="[^"]+">Stations<\/h1>/);
    expect(html.match(/class="ds entity-row ds node-row"/g)).toHaveLength(
      STATION_COUNT,
    );
    expect(html).toContain('href="/stations/metro%3Anorthgate"');
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
