import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Component from "./Tile.svelte";
import { sections } from "./test.fixtures.svelte";

describe("Tile SSR", () => {
  it("renders without errors on server", () => {
    const page = render(Component, { props: { children: sections } });
    const html = page.container.innerHTML;
    expect(html).toContain("Header");
    expect(html).toContain("Content");
    expect(html).toContain('class="ds tile surface"');
  });

  it("renders subcomponents with correct classes on server", () => {
    const page = render(Component, { props: { children: sections } });
    const html = page.container.innerHTML;
    expect(html).toContain('class="ds tile-header"');
    expect(html).toContain('class="ds tile-content"');
  });
});
