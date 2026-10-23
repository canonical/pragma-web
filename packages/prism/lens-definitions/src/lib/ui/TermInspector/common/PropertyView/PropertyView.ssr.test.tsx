import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import { PROPERTY_TERM } from "../../../../../../testing/fixtures.js";
import InspectorProbe from "../../../../../../testing/InspectorProbe.js";
import definitionsExplorerRecordsProperty from "../../../../../../testing/records/definitionsExplorerRecordsProperty.js";

describe("PropertyView SSR", () => {
  it("server-renders in the inspector over the captured store", () => {
    const html = renderToString(
      createStripHarness(
        `/definitions/${encodeURIComponent(PROPERTY_TERM)}`,
        definitionsExplorerRecordsProperty,
        createFetchSpy(),
        <InspectorProbe term={PROPERTY_TERM} />,
      ),
    );
    expect(html).toContain('class="ds property-view"');
  });
});
