/**
 * SSR posture: the whole triptych renders to static markup from a warm
 * store, INCLUDING the well's full node DOM, each node a positioned box
 * carrying its estimated geometry. No browser API, no network, no client
 * JS.
 */

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createDefinitionsPage from "../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import { UIBLOCK_TERM } from "../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";

describe("DefinitionsExplorer SSR", () => {
  it("renders all three panels — and the well's node DOM — to a string", () => {
    const fetchFn = createFetchSpy();
    const html = renderToString(
      createDefinitionsPage(UIBLOCK_TERM, definitionsExplorerRecords, fetchFn),
    );

    expect(html).toContain('data-slot="explorer-rail"');
    expect(html).toContain('data-slot="explorer-canvas"');
    expect(html).toContain('data-slot="explorer-inspector"');

    // The graph's nodes are server-rendered term links: all 29 classes
    // across the four ontologies (31 surface + 17 ds + 3 cs + 9 anatomy).
    const nodeCount = html.match(/ds term-node/g)?.length ?? 0;
    expect(nodeCount).toBe(60);
    // Server-rendered edges too (the explicit handles make paths
    // computable without measurement).
    expect(html).toContain('class="edges"');
    expect(html).toContain('class="edge ');

    // The selected term's node/rail links carry aria-current in the
    // server HTML itself.
    expect(html).toContain('aria-current="page"');
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
