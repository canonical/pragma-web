/**
 * The chip toolbar under the real providers, over the same warm store the
 * explorer reads: it server-renders its chips from that store, so the strip
 * has no empty-then-populated hydration mismatch.
 */

import { render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import definitionsExplorerRecords from "../../../../../../testing/records/definitionsExplorerRecords.js";
import { Controls } from "./index.js";

describe("Controls", () => {
  it("SERVER-RENDERS the chips from the warm store, with no fetch", () => {
    const fetchFn = createFetchSpy();
    const html = renderToString(
      createStripHarness(
        "/definitions",
        definitionsExplorerRecords,
        fetchFn,
        <Controls />,
      ),
    );

    expect(html).toContain('data-slot="explorer-controls"');
    // The live ontologies become chips, in the server markup.
    expect(html).toContain(">ds<");
    expect(html).toContain(">cs<");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("offers exactly the ontologies the graph carries, no invented ones", () => {
    render(
      createStripHarness(
        "/definitions",
        definitionsExplorerRecords,
        createFetchSpy(),
        <Controls />,
      ),
    );
    expect(
      within(screen.getByRole("group", { name: "Filter by ontology" }))
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["ds", "cs", "anatomy"]);
  });
});
