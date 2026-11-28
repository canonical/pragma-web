import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Component from "./InlineCode.svelte";
import { code, codeText } from "./test.fixtures.svelte";

describe("InlineCode SSR", () => {
  it("renders without hydration errors", () => {
    const page = render(Component, { props: { children: code } });
    const html = page.container.innerHTML;
    expect(html).toContain(codeText);
    expect(html).toContain("ds inline-code");
  });

  it("renders the same markup as React", () => {
    const page = render(Component, { props: { children: code } });
    expect(page.container.innerHTML.replace(/<!--.*?-->/g, "")).toBe(
      `<code class="ds inline-code code">${codeText}</code>`,
    );
  });
});
