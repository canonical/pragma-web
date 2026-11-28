// Ported from @canonical/react-ds-app SideNavigation

import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import SideNavigation from "./SideNavigation.svelte";
import type { FooterRoot, NavRoot } from "./types.js";

// An unlabelled group holding one navigable link.
const root: NavRoot = {
  key: "root",
  items: [{ key: "main", items: [{ url: "/machines", label: "Machines" }] }],
};

describe("SideNavigation SSR", () => {
  it("renders without throwing", () => {
    expect(() => render(SideNavigation, { props: { root } })).not.toThrow();
  });

  it("renders the root, its links and the base class", () => {
    const page = render(SideNavigation, { props: { root } });
    expect(page.container.innerHTML).toContain("ds side-navigation");
    expect(page.getByRole("link", { name: "Machines" })).toBeTruthy();
  });

  it("renders the links and disclosures without JavaScript", () => {
    const footerRoot: FooterRoot = {
      key: "footer",
      items: [{ label: "Account", items: [{ label: "Profile", url: "/me" }] }],
    };
    const page = render(SideNavigation, {
      props: { root, footerRoot, currentUrl: "/me" },
    });
    expect(
      page.getByRole("link", { name: "Machines" }).getAttribute("href"),
    ).toBe("/machines");
    // The footer's disclosure is a native <details>, seeded open on the server.
    expect(page.container.querySelector("details")?.hasAttribute("open")).toBe(
      true,
    );
  });

  it("renders the expanded rail on the server (the mobile seed runs after mount)", () => {
    const page = render(SideNavigation, { props: { root } });
    const element = page.container.firstElementChild as HTMLElement;
    expect(element.dataset.expanded).toBe("true");
  });

  it("renders the collapsed rail when defaultExpanded is false", () => {
    const page = render(SideNavigation, {
      props: { root, defaultExpanded: false },
    });
    const element = page.container.firstElementChild as HTMLElement;
    expect(element.dataset.expanded).toBe("false");
  });
});
