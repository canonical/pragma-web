/**
 * SSR posture: the inspector aside — identity, live-region contract, and
 * the selected class's record — renders to static markup from the warm
 * store.
 */

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createDefinitionsPage from "../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import { UIBLOCK_TERM } from "../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";

describe("TermInspector SSR", () => {
  it("renders the aside with its live-region contract and the class record", () => {
    const fetchFn = createFetchSpy();
    const html = renderToString(
      createDefinitionsPage(UIBLOCK_TERM, definitionsExplorerRecords, fetchFn),
    );
    expect(html).toContain('data-slot="explorer-inspector"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-label="Term inspector"');
    expect(html).toContain("ds:UIBlock");
    // The lineage breadcrumb's ⊂ chain renders server-side from the warm
    // store.
    expect(html).toContain("Lineage");
    expect(html).toContain("⊂");
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
