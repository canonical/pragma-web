import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import definitionsExplorerRecords from "../../../../../../testing/records/definitionsExplorerRecords.js";
import { Inspector } from "./index.js";

describe("Inspector SSR", () => {
  it("server-renders the term's record from the warm store", () => {
    const html = renderToString(
      createStripHarness(
        "/definitions/ds%3AUIBlock",
        definitionsExplorerRecords,
        createFetchSpy(),
        <Inspector />,
      ),
    );
    expect(html).toContain(
      '<h2 class="name" id="term-inspector-title">UI Block</h2>',
    );
  });
});
