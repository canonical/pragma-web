import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import EntityHeader from "./EntityHeader.js";

describe("EntityHeader on the server", () => {
  it("renders the mark in the heading and the address before Copy", () => {
    const html = renderToString(
      <EntityHeader
        address="metro:northgate"
        kind="Station"
        summary="The north terminus."
        title="Northgate"
      />,
    );
    expect(html).toContain('<header class="ds entity-header">');
    expect(html).toMatch(
      /<h1 class="title"><svg[^>]*>.*<\/svg>Northgate<\/h1>/,
    );
    expect(html).toContain('<code class="address">metro:northgate</code>');
    expect(html).toContain('<p class="summary">The north terminus.</p>');
  });
});
