import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createEntitySite from "../../../../../../testing/createEntitySite.js";
import createWarmEnvironment from "../../../../../../testing/createWarmEnvironment.js";
import {
  CENTRAL_EXCHANGE_CURIE,
  ENTITY_TEST_TIMEOUT_MS,
  STATIONS_BINDING,
} from "../../../../../../testing/fixtures.js";
import { EntityDetail } from "../EntityDetail/index.js";

describe("StatementGroup on the server", () => {
  it("renders a group's chips as links from the store the warm filled", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const url = `/stations/${encodeURIComponent(CENTRAL_EXCHANGE_CURIE)}`;
    const { environment } = await createWarmEnvironment(url);
    const html = renderToString(
      createEntitySite({
        url,
        environment,
        extensions: ["source", "statements"],
        children: (
          <EntityDetail
            binding={STATIONS_BINDING}
            label="Stations"
            uri={CENTRAL_EXCHANGE_CURIE}
          />
        ),
      }),
    );
    expect(html).toContain(
      '<div class="ds statement-group"><ul class="values">',
    );
    expect(html).toContain('href="/lines/metro%3Acircle-line"');
  });
});
