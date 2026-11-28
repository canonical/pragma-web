// Ported from @canonical/react-ds-app SideNavigation CollapseToggle

import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import CollapseToggle from "./CollapseToggle.svelte";

describe("CollapseToggle SSR", () => {
  it("renders without throwing", () => {
    const page = render(CollapseToggle, { props: { expanded: true } });
    expect(page.container.innerHTML).toContain("ds collapse-toggle");
    expect(page.container.innerHTML).toContain('aria-expanded="true"');
  });

  it("renders the tooltip text as a hidden description", () => {
    const page = render(CollapseToggle, { props: { expanded: false } });
    const target = page.container.querySelector(".target") as HTMLElement;
    const description = page.document.getElementById(
      target.getAttribute("aria-describedby") ?? "",
    );
    expect(description?.hidden).toBe(true);
    expect(description?.textContent).toBe("Expand");
  });
});
