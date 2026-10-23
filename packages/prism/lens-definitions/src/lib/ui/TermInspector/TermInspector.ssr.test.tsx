import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../testing/createStripHarness.js";
import { UIBLOCK_TERM } from "../../../../testing/fixtures.js";
import InspectorProbe from "../../../../testing/InspectorProbe.js";
import definitionsExplorerRecords from "../../../../testing/records/definitionsExplorerRecords.js";

describe("TermInspector SSR", () => {
  it("server-renders the aside with its live region and the class record", () => {
    const fetchFn = createFetchSpy();
    const html = renderToString(
      createStripHarness(
        "/definitions/ds%3AUIBlock",
        definitionsExplorerRecords,
        fetchFn,
        <InspectorProbe term={UIBLOCK_TERM} />,
      ),
    );
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('data-slot="explorer-inspector"');
    expect(html).toContain(
      '<h2 class="name" id="term-inspector-title">UI Block</h2>',
    );
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
