import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import definitionsExplorerRecords from "../../../../../../testing/records/definitionsExplorerRecords.js";
import { Status } from "./index.js";

describe("Status SSR", () => {
  it("server-renders the counts from the warm store", () => {
    const html = renderToString(
      createStripHarness(
        "/definitions",
        definitionsExplorerRecords,
        createFetchSpy(),
        <Status />,
      ),
    );
    expect(html).toContain('data-slot="explorer-status"');
  });
});
