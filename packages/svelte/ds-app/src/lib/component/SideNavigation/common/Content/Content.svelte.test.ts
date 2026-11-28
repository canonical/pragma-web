// Ported from @canonical/react-ds-app SideNavigation Content

import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import Content from "./Content.svelte";

const contextSwitcher = {
  currentContext: { key: "acme", name: "Acme Corp", description: "Main" },
  contexts: [{ key: "acme", name: "Acme Corp", description: "Main" }],
};

describe("Content", () => {
  it("applies custom class to the region", async () => {
    const page = await render(Content, { class: "custom-class" });
    const region = page.container.firstElementChild as HTMLElement;
    await expect.element(region).toHaveClass("ds");
    await expect.element(region).toHaveClass("side-navigation-content");
    await expect.element(region).toHaveClass("custom-class");
  });

  it("passes through additional props", async () => {
    const page = await render(Content, { "data-testid": "test-component" });
    await expect
      .element(page.getByTestId("test-component"))
      .toBeInTheDocument();
  });

  it("renders an empty landmark with no root (the landmark contract stays stable)", async () => {
    const page = await render(Content, {});
    const nav = page.getByRole("navigation");
    await expect.element(nav).toBeInTheDocument();
    expect(nav.element().children).toHaveLength(0);
  });

  it("names the landmark with aria-label", async () => {
    const page = await render(Content, { "aria-label": "Main navigation" });
    await expect
      .element(page.getByRole("navigation", { name: "Main navigation" }))
      .toBeInTheDocument();
  });

  it("renders the context switcher before the nav, outside the landmark", async () => {
    // Difference from React: anatomy SideNavigation.Content > Context
    // switcher, Nav.
    const page = await render(Content, { contextSwitcher });
    const region = page.container.firstElementChild as HTMLElement;
    const [switcher, nav] = Array.from(region.children);
    expect(
      switcher.classList.contains("side-navigation-context-switcher"),
    ).toBe(true);
    expect(nav.tagName).toBe("NAV");
    expect(nav.contains(switcher)).toBe(false);
  });

  it("renders the root's groups inside the nav", async () => {
    const page = await render(Content, {
      root: {
        key: "root",
        items: [{ key: "g", items: [{ url: "/one", label: "One" }] }],
      },
    });
    const nav = page.getByRole("navigation").element();
    expect(
      nav.contains(page.getByRole("link", { name: "One" }).element()),
    ).toBe(true);
  });
});
