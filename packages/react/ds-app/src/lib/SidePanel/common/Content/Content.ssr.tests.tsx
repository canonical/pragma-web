import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Content from "./Content.js";

describe("SidePanel.Content SSR", () => {
  it("renders without hydration errors", () => {
    const html = renderToString(<Content>Test content</Content>);
    expect(html).toContain('class="ds side-panel-content"');
    expect(html).toContain("Test content");
  });

  it("carries no overflow state in its markup — the edge lines appear after client-side measurement", () => {
    const html = renderToString(<Content>Test content</Content>);
    /*
      The edge lines come from `useScrollOverflow`, which measures the laid-out
      pane in an effect — none of which runs on the server. The flags keep
      their initial false, the attributes stay out of the markup, and the
      client adds them on its first measurement after hydration.
    */
    expect(html).not.toContain("data-overflow-top");
    expect(html).not.toContain("data-overflow-bottom");
  });

  it("carries no driven marker in its markup — the CSS fallback keys on its absence", () => {
    const html = renderToString(<Content>Test content</Content>);
    /*
      `data-overflow-driven` is stamped by an effect, which the server never
      runs — so the server markup is indistinguishable from a page without
      JavaScript. That matters: in a JS-less Chromium the scroll-driven CSS
      fallback paints the lines precisely when this attribute is missing.
    */
    expect(html).not.toContain("data-overflow-driven");
  });
});
