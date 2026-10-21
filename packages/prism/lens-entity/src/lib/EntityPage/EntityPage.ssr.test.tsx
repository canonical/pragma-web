import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createEntitySite from "../../../testing/createEntitySite.js";
import createWarmEnvironment from "../../../testing/createWarmEnvironment.js";
import { ENTITY_TEST_TIMEOUT_MS } from "../../../testing/fixtures.js";

describe("EntityPage on the server", () => {
  it("renders the station's title, summary, fields and relations from the warm store", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const url = "/stations/metro%3Anorthgate";
    const { environment, fetchFn } = await createWarmEnvironment(url);
    const html = renderToString(createEntitySite({ url, environment }));

    expect(html).toContain('class="ds entity-page"');
    expect(html).toContain('<h1 class="title">Northgate</h1>');
    expect(html).toContain("The northern terminus.");
    expect(html.match(/<tr class="field">/g)).toHaveLength(6);
    expect(html.match(/<li class="relation">/g)).toHaveLength(3);
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
