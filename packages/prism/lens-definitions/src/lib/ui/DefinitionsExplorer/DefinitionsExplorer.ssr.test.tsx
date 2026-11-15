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
    // The term's namespace drilled into: ds's 20 classes, a box for
    // anatomy and one for cs, and the two stubs, reached from a class or
    // from a box.
    expect(html.match(/<g class="node[ "]/g)).toHaveLength(24);
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
    // At rest cs is drawn class by class.
    const rest = renderToString(
      createDefinitionsPage(
        undefined,
        definitionsExplorerRecords,
        createFetchSpy(),
      ),
    );
    expect(
      rest.match(
        /data-from="cs:CodeStandard" data-kind="relation" data-to="cs:Example" data-weight="(\d+)"/,
      )?.[1],
    ).toBe("0");
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
    // anatomy's 12 classes and cs's 3, ds as one box, and the two stubs.
    expect(canvas.match(/<g class="node[ "]/g)).toHaveLength(18);
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

  it("server-renders the namespace the address's expand names drilled into, the others as box links, with no script", () => {
    const render = (term: string | undefined, search: string): string => {
      const html = renderToString(
        createDefinitionsPage(
          term,
          definitionsExplorerRecords,
          createFetchSpy(),
          search,
        ),
      );
      return html.slice(html.indexOf('data-slot="explorer-canvas"'));
    };
    const rest = render(undefined, "");
    // At rest ds is one box, a link to the page drilled into it.
    expect(rest).toContain('href="/definitions?expand=ds"');
    expect(rest).not.toContain("way-back");
    const drilled = render(undefined, "?expand=ds");
    // ds's 20 classes, a box for anatomy and one for cs, and the two stubs.
    expect(drilled.match(/<g class="node[ "]/g)).toHaveLength(24);
    // Each box once on the canvas and once in the phone view.
    expect(drilled.match(/data-kind="region"/g)).toHaveLength(4);
    expect(drilled).toContain('href="/definitions?expand=anatomy"');
    expect(drilled).toContain('href="/definitions?expand=cs"');
    // The way back, on ds's label row and on its phone header, leads to
    // the page with no expand.
    expect(
      drilled.match(/<a[^>]*class="[^"]*way-back"[^>]*href="\/definitions"/g),
    ).toHaveLength(2);
    expect(drilled).not.toContain("<script");
    // A drill is another view of the page, not the page: no link to it is
    // current.
    expect(drilled).not.toContain("aria-current");
    // A box that links is no image: its link names it.
    expect(drilled).not.toMatch(/data-kind="region"[^>]*role="img"/);
    // An unknown prefix draws the overview at rest.
    expect(render(undefined, "?expand=nowhere")).toBe(rest);
  });

  it("ignores expand on a term page, whose links carry none", () => {
    const html = renderToString(
      createDefinitionsPage(
        UIBLOCK_TERM,
        definitionsExplorerRecords,
        createFetchSpy(),
        "?expand=anatomy",
      ),
    );
    const canvas = html.slice(html.indexOf('data-slot="explorer-canvas"'));
    // The selection's drill, as with no parameter: ds drawn class by class.
    expect(canvas.match(/<g class="node[ "]/g)).toHaveLength(24);
    expect(canvas).not.toContain("expand=");
    expect(canvas).not.toContain("way-back");
    expect(canvas).toMatch(/data-kind="region"[^>]*role="img"/);
  });
});
