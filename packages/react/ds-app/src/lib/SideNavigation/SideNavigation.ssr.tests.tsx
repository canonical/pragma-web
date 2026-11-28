import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SideNavigation from "./SideNavigation.js";
import type { NavRoot } from "./types.js";

// An unlabelled group holding one navigable link.
const root: NavRoot = {
  key: "root",
  items: [{ key: "main", items: [{ url: "/machines", label: "Machines" }] }],
};

describe("SideNavigation SSR", () => {
  it("renders without hydration errors", () => {
    const html = renderToString(<SideNavigation root={root} />);
    expect(html).toContain("Machines");
    expect(html).toContain("ds side-navigation");
  });

  it("renders Content as a region around the nav, and an empty footer", () => {
    const html = renderToString(<SideNavigation root={root} />);
    expect(html).toMatch(
      /<div class="ds side-navigation-content" id="[^"]+"><nav aria-label="Main navigation">/,
    );
    expect(html).toMatch(
      /<\/nav><\/div><footer class="ds side-navigation-footer"><\/footer><\/div>$/,
    );
  });
});
