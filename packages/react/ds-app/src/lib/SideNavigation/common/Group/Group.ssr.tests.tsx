import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Group from "./Group.js";

describe("Group SSR", () => {
  it("renders without hydration errors", () => {
    const html = renderToString(
      <Group label="Hardware">
        <li>Machines</li>
      </Group>,
    );
    expect(html).toContain("ds side-navigation-group");
    expect(html).toContain("Hardware");
    expect(html).toContain("Machines");
  });

  // Skipped while the divider is hidden (operator, 2026-11-28).
  it.skip("renders the divider before the header", () => {
    const html = renderToString(
      <Group divider label="Hardware">
        <li>Machines</li>
      </Group>,
    );
    expect(html).toContain(
      '<section class="ds side-navigation-group"><hr class="divider"/><span class="ds side-navigation-group-header"',
    );
  });
});
