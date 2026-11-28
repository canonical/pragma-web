// Ported from @canonical/react-ds-app SideNavigation Group

import { render } from "@canonical/svelte-ssr-test";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Group from "./Group.svelte";

const children = createRawSnippet(() => ({
  render: () => "<li>Machines</li>",
}));

describe("Group SSR", () => {
  it("renders without throwing", () => {
    const page = render(Group, { props: { label: "Hardware", children } });
    expect(page.container.innerHTML).toContain("ds side-navigation-group");
    expect(page.container.innerHTML).toContain("Hardware");
    expect(page.container.innerHTML).toContain("Machines");
  });

  // Skipped while the divider is hidden (operator, 2026-11-28).
  it.skip("renders the divider when asked", () => {
    const page = render(Group, { props: { divider: true, children } });
    expect(page.container.querySelector("section > hr.divider")).toBeTruthy();
  });
});
