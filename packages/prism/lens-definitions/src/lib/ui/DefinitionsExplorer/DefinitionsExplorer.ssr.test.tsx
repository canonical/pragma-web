import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createDefinitionsPage from "../../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import { UIBLOCK_TERM } from "../../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../../testing/records/definitionsExplorerRecords.js";

describe("DefinitionsExplorer SSR", () => {
  it("server-renders the rail and the whole graph from the warm store", () => {
    const fetchFn = createFetchSpy();
    const html = renderToString(
      createDefinitionsPage(UIBLOCK_TERM, definitionsExplorerRecords, fetchFn),
    );
    expect(html).toContain('class="ds definitions-explorer"');
    expect(html).toContain('data-slot="explorer-rail"');
    expect(html).toContain('data-slot="explorer-canvas"');
    expect(html.match(/<g class="node[ "]/g)).toHaveLength(35);
    expect(html).toContain('class="ring is-selected"');
    expect(html).toContain('aria-current="page"');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("lays the graph out the same on every render", () => {
    const render = (): string =>
      renderToString(
        createDefinitionsPage(
          UIBLOCK_TERM,
          definitionsExplorerRecords,
          createFetchSpy(),
        ),
      );
    expect(render()).toBe(render());
  });
});
