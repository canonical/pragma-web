/**
 * The status figure under the real providers, over the same warm store the
 * explorer reads: it server-renders the live counts, and it recounts with
 * the chips that share its filter.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import definitionsExplorerRecords from "../../../../../../testing/records/definitionsExplorerRecords.js";
import { Controls } from "../Controls/index.js";
import { Status } from "./index.js";

describe("Status", () => {
  it("SERVER-RENDERS the live counts from the warm store, with no fetch", () => {
    const fetchFn = createFetchSpy();
    const html = renderToString(
      createStripHarness(
        "/definitions",
        definitionsExplorerRecords,
        fetchFn,
        <Status />,
      ),
    );

    expect(html).toContain('data-slot="explorer-status"');
    // React separates adjacent text nodes with `<!-- -->` markers in SSR
    // output, so the caption is asserted on its stripped text.
    const caption = /<figcaption class="caption">([\s\S]*?)<\/figcaption>/
      .exec(html)?.[1]
      ?.replaceAll("<!-- -->", "");
    // 35 live classes across the three ontologies, 4 of them abstract.
    expect(caption).toBe("35 of 35 classes · 4 abstract");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("counts the classes the graph shows, and recounts as chips move", () => {
    render(
      createStripHarness(
        "/definitions",
        definitionsExplorerRecords,
        createFetchSpy(),
        <>
          <Controls />
          <Status />
        </>,
      ),
    );

    // Unfiltered: everything is shown, so visible === total.
    expect(screen.getByRole("figure").textContent).toContain("35 of 35");

    // Turn the anatomy ontology off; the count drops by exactly that
    // ontology's 12 classes, and the denominator never moves.
    fireEvent.click(screen.getByRole("button", { name: "anatomy" }));
    expect(screen.getByRole("figure").textContent).toContain("23 of 35");
  });

  it("reads no term from a URL the lens does not route", () => {
    const fetchFn = createFetchSpy();
    const html = renderToString(
      createStripHarness(
        "/elsewhere",
        definitionsExplorerRecords,
        fetchFn,
        <Status />,
      ),
    );

    // The term-less explorer's variables, which the warm store fulfils.
    expect(html).toContain('data-slot="explorer-status"');
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
