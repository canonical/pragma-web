import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import InspectorProbe from "../../../../../../testing/InspectorProbe.js";
import definitionsExplorerRecords from "../../../../../../testing/records/definitionsExplorerRecords.js";
import { SPECIMENS } from "./constants.js";

describe("GraphOverview SSR", () => {
  it("server-renders every specimen and namespace", () => {
    const html = renderToString(
      createStripHarness(
        "/definitions",
        definitionsExplorerRecords,
        createFetchSpy(),
        <InspectorProbe term={undefined} />,
      ),
    );
    expect(html).toContain('class="ds graph-overview"');
    expect(html.match(/class="entry"/g)).toHaveLength(SPECIMENS.length);
  });
});
