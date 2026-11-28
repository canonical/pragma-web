// Ported from @canonical/react-ds-app SideNavigation ItemButton

import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import ItemButton from "./ItemButton.svelte";

describe("ItemButton SSR", () => {
  it("renders without throwing", () => {
    const page = render(ItemButton, { props: { children: "Log out" } });
    expect(page.container.innerHTML).toContain(
      "ds side-navigation-item-button",
    );
    expect(page.container.innerHTML).toContain("Log out");
    expect(page.container.innerHTML).toContain('type="button"');
  });
});
