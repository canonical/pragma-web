import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Item from "./Item.js";

describe("Tabs Item SSR", () => {
  it("renders to static markup without throwing", () => {
    const html = renderToString(
      <ul>
        <Item item={{ url: "/a", label: "A" }} active LinkComponent="a" />
      </ul>,
    );
    expect(html).toContain("ds tabs-item");
    expect(html).toContain('href="/a"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("A");
  });

  it("renders a static slot inside the tab action", () => {
    const html = renderToString(
      <ul>
        <Item
          item={{
            url: "/machines",
            label: "Machines",
            slot: <span className="count">42</span>,
          }}
          active={false}
          LinkComponent="a"
        />
      </ul>,
    );
    expect(html).not.toContain("tabs-static-chip-provider-v1");
    expect(html).not.toContain("data-ds-density-provider");
    expect(html).toContain('<span class="tabs-indicator">');
    expect(html.indexOf("Machines")).toBeLessThan(html.indexOf("42"));
  });
});
