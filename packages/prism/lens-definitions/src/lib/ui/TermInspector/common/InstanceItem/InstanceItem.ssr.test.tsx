import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import { COMPONENT_TERM } from "../../../../../../testing/fixtures.js";
import InspectorProbe from "../../../../../../testing/InspectorProbe.js";
import definitionsExplorerRecordsComponent from "../../../../../../testing/records/definitionsExplorerRecordsComponent.js";

describe("InstanceItem SSR", () => {
  it("server-renders in the inspector over the captured store", () => {
    const html = renderToString(
      createStripHarness(
        `/definitions/${encodeURIComponent(COMPONENT_TERM)}`,
        definitionsExplorerRecordsComponent,
        createFetchSpy(),
        <InspectorProbe term={COMPONENT_TERM} />,
      ),
    );
    expect(html).toContain('class="ds instance-item"');
  });
});
