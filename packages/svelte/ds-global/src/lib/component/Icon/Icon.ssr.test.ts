import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Component from "./Icon.svelte";

/** The server markup, without Svelte's hydration comments. */
const html = (...args: Parameters<typeof render>): string =>
  render(...args).container.innerHTML.replace(/<!--[^>]*-->/g, "");

describe("Icon SSR", () => {
  it("doesn't throw", () => {
    expect(() => {
      render(Component, { props: { icon: "user" } });
    }).not.toThrow();
  });

  it("renders", () => {
    const body = html(Component, { props: { icon: "user" } });
    expect(body).toContain("<svg");
    expect(body).toContain("</svg>");
  });

  it("applies class", () => {
    const body = html(Component, {
      props: { class: "test-class", icon: "user" },
    });
    expect(body).toContain(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="ds icon test-class" aria-hidden="true"><use href="/icons/user.svg#user"></use></svg>',
    );
  });

  it("renders a named image when aria-label is provided", () => {
    const body = html(Component, {
      props: { icon: "user", "aria-label": "User" },
    });
    expect(body).toContain('role="img"');
    expect(body).toContain('aria-label="User"');
    expect(body).not.toContain("aria-hidden");
  });
});
