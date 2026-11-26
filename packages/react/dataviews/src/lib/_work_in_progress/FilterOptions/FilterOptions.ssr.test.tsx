import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import FilterOptions from "./FilterOptions.js";

describe("FilterOptions SSR", () => {
  it("renders a word without an address as inert text, the current one marked", () => {
    const html = renderToString(
      <FilterOptions
        label="Status"
        options={[
          {
            value: "All",
            label: "All",
            current: false,
            onSelect: () => undefined,
          },
          {
            value: "deployed",
            label: "deployed",
            current: true,
            onSelect: () => undefined,
          },
        ]}
      />,
    );
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<a ");
    expect(html).toMatch(/<span class="word" aria-current="true">deployed/);
  });

  it("renders a word with an address as a link before scripts run", () => {
    const html = renderToString(
      <FilterOptions
        label="Status"
        options={[
          { value: "All", label: "All", current: false, href: "?" },
          {
            value: "deployed",
            label: "deployed",
            current: true,
            href: "?status=deployed",
          },
        ]}
      />,
    );
    expect(html).toContain('<a class="word" href="?status=deployed"');
    expect(html).toMatch(/href="\?status=deployed" aria-current="true"/);
  });
});
