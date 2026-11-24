import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Component from "./DropdownButton.js";

const html = renderToString(
  <Component items={[{ url: "/docs", label: "Docs" }]}>View</Component>,
);

describe("DropdownButton SSR", () => {
  it("renders the button, with its class and chevron, then the closed menu", () => {
    expect(html).toMatch(
      /^<button[^>]*class="ds button primary ds contextual-menu-trigger ds dropdown-button"/,
    );
    expect(html).toMatch(
      /<span class="label">View<span class="chevron"><svg[^>]*aria-hidden="true"/,
    );
    expect(html).toMatch(/<\/button><div [^>]*popover="auto"/);
  });

  it("opens the menu natively, with no ARIA that waits for scripts", () => {
    const id = html.match(/<div [^>]*id="([^"]+)"/)?.at(1) ?? "";
    expect(html.toLowerCase()).toContain(`popovertarget="${id.toLowerCase()}"`);
    expect(html).not.toMatch(/aria-haspopup|aria-expanded|aria-controls/);
    expect(html).toContain('<a class="ds contextual-menu-item" href="/docs">');
  });
});
