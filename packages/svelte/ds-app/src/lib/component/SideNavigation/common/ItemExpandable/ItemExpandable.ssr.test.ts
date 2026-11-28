// Ported from @canonical/react-ds-app SideNavigation ItemExpandable

import { render } from "@canonical/svelte-ssr-test";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import ItemExpandable from "./ItemExpandable.svelte";

describe("ItemExpandable SSR", () => {
  it("renders without throwing", () => {
    const page = render(ItemExpandable, {
      props: {
        heading: "Hardware",
        defaultExpanded: true,
        children: createRawSnippet(() => ({
          render: () => "<li>Machines</li>",
        })),
      },
    });
    expect(page.container.innerHTML).toContain(
      "ds side-navigation-item-expandable",
    );
    expect(page.container.innerHTML).toContain("Hardware");
    expect(page.container.innerHTML).toContain("Machines");
    expect(page.container.querySelector("details")?.hasAttribute("open")).toBe(
      true,
    );
  });
});
