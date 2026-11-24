import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Component from "./Provider.js";

describe("Modal SSR", () => {
  it("doesn't throw", () => {
    expect(() =>
      renderToString(
        <Component ref={createRef<HTMLDialogElement>()}>
          <Component.Content>Placeholder content</Component.Content>
        </Component>,
      ),
    ).not.toThrow();
  });

  it("renders the dialog and its composed parts", () => {
    const html = renderToString(
      <Component ref={createRef<HTMLDialogElement>()}>
        <Component.Header>Title</Component.Header>
        <Component.Content>Placeholder content</Component.Content>
        <Component.Footer>
          <button type="button">Confirm</button>
        </Component.Footer>
      </Component>,
    );
    expect(html).toContain('class="ds modal"');
    expect(html).toContain('class="ds modal-header"');
    expect(html).toContain('class="ds modal-content"');
    expect(html).toContain('class="ds modal-footer"');
  });

  it("renders closed when open is omitted or false", () => {
    const htmlClosedDefault = renderToString(
      <Component ref={createRef<HTMLDialogElement>()}>
        <Component.Content>Placeholder content</Component.Content>
      </Component>,
    );
    expect(htmlClosedDefault).not.toMatch(/<dialog[^>]*\sopen/);
    expect(htmlClosedDefault).not.toContain("modal-non-modal-backdrop");

    const htmlClosedExplicit = renderToString(
      <Component open={false}>
        <Component.Content>Placeholder content</Component.Content>
      </Component>,
    );
    expect(htmlClosedExplicit).not.toMatch(/<dialog[^>]*\sopen/);
    expect(htmlClosedExplicit).not.toContain("modal-non-modal-backdrop");
  });

  it("renders open and includes the non-modal backdrop when open is true", () => {
    const html = renderToString(
      <Component open>
        <Component.Content>Placeholder content</Component.Content>
      </Component>,
    );
    expect(html).toMatch(/<dialog[^>]*\sopen/);
    expect(html).toMatch(
      /<div class="ds modal-non-modal-backdrop"><\/div><dialog[^>]*\sopen/,
    );
  });
});
