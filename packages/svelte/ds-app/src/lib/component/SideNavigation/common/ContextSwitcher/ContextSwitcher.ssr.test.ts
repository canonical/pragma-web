// Ported from @canonical/react-ds-app SideNavigation ContextSwitcher

import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import ContextSwitcher from "./ContextSwitcher.svelte";
import type { ContextSwitcherItem } from "./types.js";

const contexts: ContextSwitcherItem[] = [
  { key: "acme", name: "Acme Corp", description: "Main account" },
];

describe("ContextSwitcher SSR", () => {
  it("renders without throwing", () => {
    const page = render(ContextSwitcher, {
      props: { currentContext: contexts[0], contexts },
    });
    expect(page.container.innerHTML).toContain(
      "ds side-navigation-context-switcher",
    );
    expect(page.container.innerHTML).toContain("Acme Corp");
  });

  it("renders the menu closed", () => {
    const page = render(ContextSwitcher, {
      props: { currentContext: contexts[0], contexts },
    });
    const trigger = page.container.querySelector(".trigger");
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
    expect(
      page.container
        .querySelector('[role="menu"]')
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
  });
});
