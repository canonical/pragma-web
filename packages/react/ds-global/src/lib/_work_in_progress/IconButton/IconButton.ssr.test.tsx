import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Component from "./IconButton.js";

describe("IconButton SSR", () => {
  it("doesn't throw", () => {
    expect(() => {
      renderToString(<Component icon="edit" aria-label="Edit" />);
    }).not.toThrow();
  });

  it("renders a button with Button's and its own classes", () => {
    const html = renderToString(<Component icon="edit" aria-label="Edit" />);
    expect(html).toContain("<button");
    // As a set: the attribute names `ds` twice.
    const classes = html
      .match(/<button[^>]* class="([^"]*)"/)
      ?.at(1)
      ?.split(" ");
    expect(new Set(classes)).toEqual(
      new Set(["ds", "button", "primary", "icon-button"]),
    );
    expect(html).toContain('aria-label="Edit"');
  });

  it("names its own class with the ds scope, after Button's classes", () => {
    // In order, duplicates kept.
    const html = renderToString(<Component icon="edit" aria-label="Edit" />);
    expect(
      html
        .match(/<button[^>]* class="([^"]*)"/)
        ?.at(1)
        ?.split(" "),
    ).toEqual(["ds", "button", "primary", "ds", "icon-button"]);
  });

  it("renders the <button> as the root of the server HTML", () => {
    const html = renderToString(<Component icon="edit" aria-label="Edit" />);
    expect(html).toMatch(/^<button /);
  });
});
