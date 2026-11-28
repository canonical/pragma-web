// Ported from @canonical/react-ds-app SideNavigation Item

import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Item from "./Item.svelte";

describe("Item SSR", () => {
  it("renders without throwing", () => {
    const page = render(Item, {
      props: { url: "/machines", children: "Machines" },
    });
    expect(page.container.innerHTML).toContain("ds side-navigation-item");
    expect(page.container.innerHTML).toContain("Machines");
  });
});
