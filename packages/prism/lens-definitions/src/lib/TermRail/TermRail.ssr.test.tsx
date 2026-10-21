/**
 * SSR posture: the rail's full term listing — groups, prefixed hrefs, the
 * filter control at its empty default — renders to static markup from the
 * warm store.
 */

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createDefinitionsPage from "../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import { UIBLOCK_TERM } from "../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";

describe("TermRail SSR", () => {
  it("renders the groups and percent-encoded term hrefs", () => {
    const fetchFn = createFetchSpy();
    const html = renderToString(
      createDefinitionsPage(UIBLOCK_TERM, definitionsExplorerRecords, fetchFn),
    );
    expect(html).toContain('data-slot="explorer-rail"');
    expect(html).toContain('aria-label="Ontology terms"');
    expect(html).toContain('href="/definitions/ds%3AComponent"');
    expect(html).toContain('href="/definitions/cs%3ACodeStandard"');
    expect(html).toContain('href="/definitions/anatomy%3ANamedNode"');
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
