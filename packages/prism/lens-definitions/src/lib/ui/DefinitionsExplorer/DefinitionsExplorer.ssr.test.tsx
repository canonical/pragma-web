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
    // The 35 classes and the two stubs their relations reach.
    expect(html.match(/<g class="node[ "]/g)).toHaveLength(37);
    expect(html).toContain('class="ring is-selected"');
    expect(html).toContain('aria-current="page"');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("weighs each relation by the class edges the store holds", () => {
    const html = renderToString(
      createDefinitionsPage(
        UIBLOCK_TERM,
        definitionsExplorerRecords,
        createFetchSpy(),
      ),
    );
    const weightOf = (from: string, to: string): string | undefined =>
      html.match(
        new RegExp(
          `data-from="${from}" data-kind="relation" data-to="${to}" data-weight="(\\d+)"`,
        ),
      )?.[1];
    // ds:hasTokenBinding and ds:viaBlock, 1,010 statements each: the bundle
    // weighs its heavier relation, not their sum.
    expect(weightOf("ds:TokenBinding", "ds:UIBlock")).toBe("1010");
    expect(weightOf("cs:CodeStandard", "cs:Example")).toBe("0");
    expect(html.match(/stroke-dasharray="4 4"/g)?.length).toBeGreaterThan(0);
  });

  it("server-renders the overview's canvas byte for byte the same from its records in any order", () => {
    // The same records with every list the provider serves reversed: the
    // namespaces, their classes and properties, and the class edges. A Map
    // filled in the order the provider answers, or a sort with no
    // tie-break, from the store to the markup would change the bytes.
    const reversed = Object.fromEntries(
      Object.entries(definitionsExplorerRecords).map(([id, record]) => [
        id,
        record === null || record === undefined
          ? record
          : Object.fromEntries(
              Object.entries(record).map(([field, value]) => [
                field,
                typeof value === "object" &&
                value !== null &&
                "__refs" in value &&
                Array.isArray(value.__refs)
                  ? { ...value, __refs: value.__refs.toReversed() }
                  : value,
              ]),
            ),
      ]),
    ) as typeof definitionsExplorerRecords;
    // The canvas, from its slot to the page's end: the rail lists the
    // namespaces in the order they are served.
    const render = (records: typeof definitionsExplorerRecords): string => {
      const html = renderToString(
        createDefinitionsPage(undefined, records, createFetchSpy()),
      );
      return html.slice(html.indexOf('data-slot="explorer-canvas"'));
    };
    const canvas = render(definitionsExplorerRecords);
    expect(canvas.match(/<g class="node[ "]/g)).toHaveLength(37);
    expect(render(reversed)).toBe(canvas);
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
