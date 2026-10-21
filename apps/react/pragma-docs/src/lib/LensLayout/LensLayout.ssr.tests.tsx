import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ModeStrip } from "#lib/ModeStrip";
import LensLayout from "./LensLayout.js";

describe("LensLayout SSR", () => {
  it("server-renders every region with the page in the canvas", () => {
    const html = renderToString(
      <LensLayout
        footer={<p>The colophon</p>}
        rail={<nav aria-label="Primary" data-region="primary-nav" />}
        strip={<ModeStrip />}
      >
        Test content
      </LensLayout>,
    );
    expect(html).toContain('class="ds lens-layout"');
    expect(html).toContain('data-region="primary-nav"');
    expect(html).toContain('data-region="mode-strip"');
    expect(html).toContain('data-region="canvas"');
    expect(html).toContain('data-region="footer"');
    expect(html).toMatch(/<main[^>]*>Test content<\/main>/);
  });
});
