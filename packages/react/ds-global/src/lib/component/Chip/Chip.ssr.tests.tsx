import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Component from "./Chip.js";

describe("Chip SSR", () => {
  it("renders an action chip as a non-submitting button", () => {
    const html = renderToString(
      <Component lead="Owner" value="Bob" onClick={() => {}} />,
    );

    expect(html).toBe(
      '<button type="button" title="Owner: Bob" class="ds chip">' +
        '<span class="lead">Owner:</span> <span class="value">Bob</span>' +
        "</button>",
    );
  });

  it("renders a dismissible chip as a span holding its dismiss control", () => {
    const html = renderToString(
      <Component value="Bob" criticality="warning">
        <Component.Dismiss onClick={() => {}} />
      </Component>,
    );

    expect(html).toMatch(/^<span title="Bob" class="ds chip warning">/);
    expect(html).toContain(
      '<button type="button" aria-label="Dismiss Bob" class="ds chip-dismiss">',
    );
    expect(html).toContain('<use href="/icons/close.svg#close"></use>');
  });

  it("renders the icon and badge slots in order", () => {
    const html = renderToString(
      <Component
        value="Projects"
        icon="archive"
        badge={<span>3</span>}
        onClick={() => {}}
      />,
    );

    expect(html.indexOf('class="icon"')).toBeLessThan(
      html.indexOf('class="value"'),
    );
    expect(html.indexOf('class="value"')).toBeLessThan(
      html.indexOf('class="badge"'),
    );
  });
});
