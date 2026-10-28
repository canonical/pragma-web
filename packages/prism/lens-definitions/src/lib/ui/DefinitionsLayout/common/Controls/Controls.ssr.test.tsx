import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import definitionsExplorerRecords from "../../../../../../testing/records/definitionsExplorerRecords.js";
import { Controls } from "./index.js";

describe("Controls SSR", () => {
  it("server-renders a chip per ontology from the warm store", () => {
    const html = renderToString(
      createStripHarness(
        "/definitions",
        definitionsExplorerRecords,
        createFetchSpy(),
        <Controls />,
      ),
    );
    expect(html).toContain(">anatomy<");
  });
});
