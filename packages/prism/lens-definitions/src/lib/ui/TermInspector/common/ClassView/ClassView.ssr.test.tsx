import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import { UIBLOCK_TERM } from "../../../../../../testing/fixtures.js";
import InspectorProbe from "../../../../../../testing/InspectorProbe.js";
import definitionsExplorerRecords from "../../../../../../testing/records/definitionsExplorerRecords.js";

describe("ClassView SSR", () => {
  it("server-renders in the inspector over the captured store", () => {
    const html = renderToString(
      createStripHarness(
        `/definitions/${encodeURIComponent(UIBLOCK_TERM)}`,
        definitionsExplorerRecords,
        createFetchSpy(),
        <InspectorProbe term={UIBLOCK_TERM} />,
      ),
    );
    expect(html).toContain('class="ds class-view view"');
  });
});
