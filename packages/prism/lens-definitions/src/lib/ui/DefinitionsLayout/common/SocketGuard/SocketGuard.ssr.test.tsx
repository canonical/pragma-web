import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import definitionsExplorerRecords from "../../../../../../testing/records/definitionsExplorerRecords.js";
import { Status } from "../Status/index.js";
import { SocketGuard } from "./index.js";

describe("SocketGuard SSR", () => {
  it("renders its tenant over a warm store, and its fallback over a cold one", () => {
    const tenant = (
      <SocketGuard fallback={<p>Loading</p>}>
        <Status />
      </SocketGuard>
    );
    expect(
      renderToString(
        createStripHarness(
          "/definitions",
          definitionsExplorerRecords,
          createFetchSpy(),
          tenant,
        ),
      ),
    ).toContain('data-slot="explorer-status"');
    expect(
      renderToString(
        createStripHarness("/definitions", undefined, createFetchSpy(), tenant),
      ),
    ).toContain("Loading");
  });
});
