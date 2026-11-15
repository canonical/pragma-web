import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ComponentProse from "./ComponentProse.js";

describe("ComponentProse SSR", () => {
  it("server-renders the text under its root", () => {
    const html = renderToString(
      <ComponentProse source={"## Heading\n\nText"} />,
    );
    expect(html).toContain(
      '<div class="ds component-prose editorial content-flow">',
    );
    expect(html).toMatch(/<h4[^>]*>Heading<\/h4>/);
    expect(html).toContain("<p>Text</p>");
  });
});
