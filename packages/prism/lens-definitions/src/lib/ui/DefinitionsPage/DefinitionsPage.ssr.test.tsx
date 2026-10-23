/**
 * SSR posture: the page's canvas identity (`data-view` + the SSR layout
 * suite's h1 marker) and the term view's real content render to a string
 * from the warm store.
 */

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createDefinitionsPage from "../../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import { UIBLOCK_TERM } from "../../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../../testing/records/definitionsExplorerRecords.js";

describe("DefinitionsPage SSR", () => {
  it("renders the marker, the view identity, and the term's content", () => {
    const fetchFn = createFetchSpy();
    const html = renderToString(
      createDefinitionsPage(UIBLOCK_TERM, definitionsExplorerRecords, fetchFn),
    );
    expect(html).toContain('id="lens-definitions-title"');
    expect(html).toContain('data-view="definitions"');
    expect(html).toContain("UI Block");
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
