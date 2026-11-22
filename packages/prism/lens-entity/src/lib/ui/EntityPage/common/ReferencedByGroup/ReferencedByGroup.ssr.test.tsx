import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createEntitySite from "../../../../../../testing/createEntitySite.js";
import createWarmEnvironment from "../../../../../../testing/createWarmEnvironment.js";
import {
  CIRCLE_LINE_CURIE,
  ENTITY_TEST_TIMEOUT_MS,
  LINES_BINDING,
} from "../../../../../../testing/fixtures.js";
import { EntityDetail } from "../EntityDetail/index.js";

describe("ReferencedByGroup on the server", () => {
  it("renders the group's title and its values from the store the warm filled", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const url = `/lines/${encodeURIComponent(CIRCLE_LINE_CURIE)}`;
    const { environment } = await createWarmEnvironment(url);
    const html = renderToString(
      createEntitySite({
        url,
        environment,
        extensions: ["source", "statements"],
        children: (
          <EntityDetail
            binding={LINES_BINDING}
            label="Lines"
            uri={CIRCLE_LINE_CURIE}
          />
        ),
      }),
    );
    expect(html).toContain(
      '<section class="ds referenced-by-group"><h3 class="title">served by · 6</h3><div class="ds statement-group">',
    );
  });
});
