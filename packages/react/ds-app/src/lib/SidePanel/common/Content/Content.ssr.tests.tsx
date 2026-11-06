import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Content from "./Content.js";

describe("SidePanel.Content SSR", () => {
  it("renders without hydration errors", () => {
    const html = renderToString(<Content>Test content</Content>);
    expect(html).toContain('class="ds side-panel-content"');
    expect(html).toContain("Test content");
  });

  it("carries no overflow state in its markup — the attributes are the JavaScript fallback's, measured client-side", () => {
    const html = renderToString(<Content>Test content</Content>);
    /*
      The overflow attributes publish what `useScrollOverflow` measures, and
      effects never run on the server. In engines with scroll-driven
      animations the CSS paints the lines with no help from the markup at
      all; in the rest, the client measures after hydration and adds the
      attributes on its first pass.
    */
    expect(html).not.toContain("data-overflow-top");
    expect(html).not.toContain("data-overflow-bottom");
  });
});
