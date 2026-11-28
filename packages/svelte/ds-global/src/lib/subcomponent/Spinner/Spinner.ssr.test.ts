import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Component from "./Spinner.svelte";

/** The server markup, without Svelte's hydration comments. */
const html = (...args: Parameters<typeof render>): string =>
  render(...args).container.innerHTML.replace(/<!--[^>]*-->/g, "");

describe("Spinner SSR", () => {
  it("doesn't throw", () => {
    expect(() => {
      render(Component);
    }).not.toThrow();
  });

  it("renders the spinner icon", () => {
    const body = html(Component);
    expect(body).toContain("<svg");
    expect(body).toContain('href="/icons/spinner.svg#spinner"');
  });

  it("applies class", () => {
    const body = html(Component, { props: { class: "test-class" } });
    expect(body).toContain(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="ds spinner test-class" aria-hidden="true"><use href="/icons/spinner.svg#spinner"></use></svg>',
    );
  });

  it("renders a named image when aria-label is provided", () => {
    const body = html(Component, {
      props: { "aria-label": "Loading" },
    });
    expect(body).toContain('role="img"');
    expect(body).toContain('aria-label="Loading"');
    expect(body).not.toContain("aria-hidden");
  });
});
