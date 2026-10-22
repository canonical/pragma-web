import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createDefinitionsLayout from "../../../testing/createDefinitionsLayout.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";

describe("DefinitionsLayout on the server", () => {
  it("server-renders the rail, the claimed strip and the canvas from a warm store", () => {
    const fetchFn = createFetchSpy();
    const html = renderToString(
      createDefinitionsLayout({
        url: "/definitions/ds%3AUIBlock",
        records: definitionsExplorerRecords,
        fetchFn,
        rail: <nav aria-label="Site rail" />,
        children: <p>Routed page</p>,
      }),
    );

    expect(html).toContain('class="ds workspace-layout"');
    expect(html).toContain('aria-label="Site rail"');
    expect(html).toContain('data-slot="explorer-controls"');
    expect(html).toContain('data-slot="explorer-status"');
    expect(html).toContain("ds:UIBlock");
    expect(html).toContain("<p>Routed page</p>");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("keeps the layout standing with empty sockets over a cold store", () => {
    const html = renderToString(
      createDefinitionsLayout({
        url: "/definitions",
        records: undefined,
        fetchFn: createFetchSpy(),
        rail: <nav aria-label="Site rail" />,
        children: <p>Routed page</p>,
      }),
    );

    expect(html).toContain('aria-label="Site rail"');
    expect(html).toContain("<p>Routed page</p>");
    expect(html).not.toContain('data-slot="explorer-controls"');
  });
});
