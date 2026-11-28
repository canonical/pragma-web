// Ported from @canonical/react-ds-app SideNavigation

import { tick } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page as browser } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { render } from "vitest-browser-svelte";
import SideNavigation from "./SideNavigation.svelte";
import { brand, brandLink, fixtureText } from "./test.fixtures.svelte";
import type { FooterRoot, NavRoot } from "./types.js";

// root.items are groups; navigable links live in a group's own items. Here a
// single unlabelled group holds the links (no header rendered).
const root: NavRoot = {
  key: "root",
  items: [
    {
      key: "main",
      items: [
        { url: "/machines", label: "Machines" },
        { url: "/devices", label: "Devices" },
      ],
    },
  ],
};

const footerRoot: FooterRoot = {
  key: "footer",
  items: [{ label: "Settings", url: "/settings" }],
};

const contextSwitcher = {
  currentContext: { key: "default", name: "default", description: "Default" },
  contexts: [
    { key: "default", name: "default", description: "Default" },
    { key: "staging", name: "staging", description: "Staging" },
  ],
};

const pressCtrlB = () =>
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key: "b", ctrlKey: true, cancelable: true }),
  );

function componentRoot(page: RenderResult<typeof SideNavigation>): HTMLElement {
  return page.container.firstElementChild as HTMLElement;
}

describe("SideNavigation", () => {
  // A desktop viewport: below 620px the rail collapses after mount and the
  // content region is hidden.
  beforeEach(async () => {
    await browser.viewport(1024, 768);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders as a self-contained nav landmark", async () => {
    const page = await render(SideNavigation, { root });
    await expect
      .element(page.getByRole("navigation", { name: "Main navigation" }))
      .toBeInTheDocument();
  });

  it("allows overriding the default aria-label", async () => {
    const page = await render(SideNavigation, {
      root,
      "aria-label": "Product navigation",
    });
    await expect
      .element(page.getByRole("navigation", { name: "Product navigation" }))
      .toBeInTheDocument();
  });

  it("renders its built-in text from messages, for translation", async () => {
    const page = await render(SideNavigation, {
      root,
      messages: {
        skipToContent: () => "Aller au contenu principal",
        navigation: () => "Navigation principale",
        collapseNavigation: () => "Réduire la navigation",
        closeMenu: () => "Fermer le menu",
      },
    });

    // The skip link is visually hidden until focused, so query the DOM.
    expect(componentRoot(page).querySelector(".skip-link")?.textContent).toBe(
      "Aller au contenu principal",
    );
    await expect
      .element(page.getByRole("navigation", { name: "Navigation principale" }))
      .toBeInTheDocument();
    const toggle = page.getByRole("button", { name: "Réduire la navigation" });
    expect(toggle.element().textContent).toContain("Fermer le menu");
  });

  it("keeps the English default for any message left out", async () => {
    const page = await render(SideNavigation, {
      root,
      messages: { navigation: () => "Navigation principale" },
    });

    expect(componentRoot(page).querySelector(".skip-link")?.textContent).toBe(
      "Skip to main content",
    );
    await expect
      .element(page.getByRole("button", { name: "Collapse navigation" }))
      .toBeInTheDocument();
  });

  it("renders the skip link first in DOM order", async () => {
    const page = await render(SideNavigation, { root });
    const first = componentRoot(page).firstElementChild;
    expect(first?.classList.contains("skip-link")).toBe(true);
    expect(first?.textContent).toBe("Skip to main content");
    expect(first?.getAttribute("href")).toBe("#main-content");
  });

  it("points the skip link at the skipTo target", async () => {
    const page = await render(SideNavigation, { root, skipTo: "#my-main" });
    expect(
      componentRoot(page).querySelector(".skip-link")?.getAttribute("href"),
    ).toBe("#my-main");
  });

  it("renders the root items in the content region", async () => {
    const page = await render(SideNavigation, { root });
    await expect.element(page.getByText("Machines")).toBeInTheDocument();
    await expect.element(page.getByText("Devices")).toBeInTheDocument();
  });

  it("applies the base and custom class to the root", async () => {
    const page = await render(SideNavigation, { root, class: "custom-class" });
    await expect.element(componentRoot(page)).toHaveClass("ds");
    await expect.element(componentRoot(page)).toHaveClass("side-navigation");
    await expect.element(componentRoot(page)).toHaveClass("custom-class");
  });

  it("passes native attributes through to the root", async () => {
    const page = await render(SideNavigation, {
      root,
      "data-testid": "side-navigation",
    });
    expect(componentRoot(page).dataset.testid).toBe("side-navigation");
  });

  it("renders the brand in the header", async () => {
    const page = await render(SideNavigation, { root, brand });
    await expect.element(page.getByText(fixtureText.brand)).toBeInTheDocument();
  });

  it("renders the application name in the header", async () => {
    const page = await render(SideNavigation, {
      root,
      applicationName: "MAAS",
    });
    await expect
      .element(page.getByRole("heading", { name: "MAAS" }))
      .toBeInTheDocument();
  });

  it("renders the footer items when footerRoot is provided", async () => {
    const page = await render(SideNavigation, { root, footerRoot });
    await expect.element(page.getByText("Settings")).toBeInTheDocument();
  });

  it("always renders the footer region, empty without footerRoot", async () => {
    // Difference from React: the anatomy gives the Footer cardinality 1.
    const page = await render(SideNavigation, { root });
    const footer = componentRoot(page).querySelector(
      ":scope > footer.ds.side-navigation-footer",
    );
    expect(footer).not.toBeNull();
    expect(footer?.querySelector("li")).toBeNull();
  });

  it("marks the currentUrl item as the current page", async () => {
    const page = await render(SideNavigation, { root, currentUrl: "/devices" });
    await expect
      .element(page.getByRole("link", { name: "Devices" }))
      .toHaveAttribute("aria-current", "page");
    await expect
      .element(page.getByRole("link", { name: "Machines" }))
      .not.toHaveAttribute("aria-current");
  });

  it("follows currentUrl when it changes", async () => {
    const page = await render(SideNavigation, { root, currentUrl: "/devices" });
    await page.rerender({ currentUrl: "/machines" });
    await expect
      .element(page.getByRole("link", { name: "Machines" }))
      .toHaveAttribute("aria-current", "page");
    await expect
      .element(page.getByRole("link", { name: "Devices" }))
      .not.toHaveAttribute("aria-current");
  });

  it("toggles expanded state (uncontrolled) and reflects it on the root", async () => {
    const page = await render(SideNavigation, { root });
    const element = componentRoot(page);
    expect(element.dataset.expanded).toBe("true");

    await page.getByRole("button", { name: "Collapse navigation" }).click();
    await expect.element(element).toHaveAttribute("data-expanded", "false");

    // The attribute is the single source of truth for the rail state: no
    // collapsed class is authored on the root.
    expect(element.className).toBe("ds side-navigation");
  });

  it("hides the content region when collapsed", async () => {
    const page = await render(SideNavigation, {
      root,
      defaultExpanded: false,
    });
    await expect
      .element(page.getByRole("navigation", { includeHidden: true }))
      .not.toBeVisible();
  });

  it("wires the toggle's aria-controls to the content region", async () => {
    const page = await render(SideNavigation, { root });
    const toggle = page.getByRole("button", { name: "Collapse navigation" });
    const controlledId = toggle.element().getAttribute("aria-controls");
    expect(controlledId).toBeTruthy();
    const region = document.getElementById(controlledId as string);
    expect(region?.classList.contains("side-navigation-content")).toBe(true);
    expect(region?.contains(page.getByText("Machines").element())).toBe(true);
  });

  it("keeps the footer's expandable sub-items in the DOM when collapsed", async () => {
    // Collapse is CSS-only: the popover degradation shows the sub-items, but
    // the tree must render regardless so Tab navigation and the
    // accessibility tree survive.
    const footerWithExpandable: FooterRoot = {
      key: "footer",
      items: [
        { label: "Account", items: [{ label: "Profile", url: "/profile" }] },
      ],
    };
    const page = await render(SideNavigation, {
      root,
      defaultExpanded: false,
      footerRoot: footerWithExpandable,
    });
    expect(page.container.querySelector('a[href="/profile"]')).not.toBeNull();
    expect(page.container.querySelector("details")).not.toBeNull();
  });

  it("marks the active footer row and opens its expandable parent", async () => {
    const footerWithExpandable: FooterRoot = {
      key: "footer",
      items: [
        { label: "Settings", url: "/settings" },
        { label: "Account", items: [{ label: "Profile", url: "/profile" }] },
      ],
    };
    const page = await render(SideNavigation, {
      root,
      footerRoot: footerWithExpandable,
      currentUrl: "/profile",
    });
    expect(
      page
        .getByRole("link", { name: "Profile" })
        .element()
        .closest("li")
        ?.getAttribute("data-active"),
    ).toBe("true");
    expect(
      page
        .getByRole("link", { name: "Settings" })
        .element()
        .closest("li")
        ?.hasAttribute("data-active"),
    ).toBe(false);
    expect(page.container.querySelector("details")?.hasAttribute("open")).toBe(
      true,
    );
  });

  it("collapses via the Ctrl+B shortcut by default", async () => {
    const page = await render(SideNavigation, { root });
    pressCtrlB();
    await expect
      .element(componentRoot(page))
      .toHaveAttribute("data-expanded", "false");
  });

  it("ignores the Ctrl+B shortcut when keyboardShortcut is false", async () => {
    const page = await render(SideNavigation, {
      root,
      keyboardShortcut: false,
    });
    pressCtrlB();
    await tick();
    expect(componentRoot(page).dataset.expanded).toBe("true");
  });

  it("collapses after mount on a small viewport when defaultExpanded is left unset", async () => {
    // The expanded state renders as a fullscreen overlay below the small
    // breakpoint, so the unset default must not ship as a first-paint
    // takeover on a phone.
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
    } as MediaQueryList);
    const page = await render(SideNavigation, { root });
    await expect
      .element(componentRoot(page))
      .toHaveAttribute("data-expanded", "false");
  });

  it("keeps an explicit defaultExpanded on every viewport", async () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
    } as MediaQueryList);
    const page = await render(SideNavigation, { root, defaultExpanded: true });
    await tick();
    expect(componentRoot(page).dataset.expanded).toBe("true");
  });

  it("stays expanded on a wide viewport when defaultExpanded is left unset", async () => {
    const page = await render(SideNavigation, { root });
    await tick();
    expect(componentRoot(page).dataset.expanded).toBe("true");
  });

  it("responds to the collapse shortcut when keyboardShortcut is enabled", async () => {
    const page = await render(SideNavigation, {
      root,
      keyboardShortcut: true,
    });
    pressCtrlB();
    await expect
      .element(componentRoot(page))
      .toHaveAttribute("data-expanded", "false");
  });

  it("orders focusable elements logo → collapse toggle → content → footer", async () => {
    const page = await render(SideNavigation, {
      root,
      footerRoot,
      brand: brandLink,
    });
    const focusable = Array.from(
      page.container.querySelectorAll("a, button"),
    ) as HTMLElement[];
    const labels = focusable.map(
      (element) =>
        element.getAttribute("aria-label") || element.textContent?.trim(),
    );
    expect(labels).toEqual([
      "Skip to main content", // skip navigation, first in DOM order
      fixtureText.brandLink, // brand/logo
      "Collapse navigation", // collapse toggle
      "Machines", // content, top-to-bottom
      "Devices",
      "Settings", // footer, top-to-bottom
    ]);
  });

  it("renders the ContextSwitcher at the top of the content region, outside the nav landmark", async () => {
    // Difference from React: the anatomy places the context switcher inside
    // SideNavigation.Content, before the Nav; React renders it as a sibling
    // region between Header and Content.
    const page = await render(SideNavigation, { root, contextSwitcher });
    const switcher = page.container.querySelector(
      ".ds.side-navigation-context-switcher",
    ) as HTMLElement;
    expect(switcher).not.toBeNull();
    // Skip link, header, content region, footer.
    expect(componentRoot(page).children).toHaveLength(4);
    const region = switcher.parentElement as HTMLElement;
    expect(region.classList.contains("side-navigation-content")).toBe(true);
    const nav = page
      .getByRole("navigation", { name: "Main navigation" })
      .element();
    expect(nav.contains(switcher)).toBe(false);
    expect(switcher.nextElementSibling).toBe(nav);
  });

  it("hides the ContextSwitcher when collapsed", async () => {
    // Collapsed, the root's data-expanded hides the whole content region,
    // the switcher with it.
    const page = await render(SideNavigation, {
      root,
      defaultExpanded: false,
      contextSwitcher,
    });
    expect(componentRoot(page).dataset.expanded).toBe("false");
    const switcher = page.container.querySelector(
      ".ds.side-navigation-context-switcher",
    ) as HTMLElement;
    expect(switcher.hasAttribute("data-expanded")).toBe(false);
    await expect.element(switcher).not.toBeVisible();
  });

  it("renders links through the link snippet", async () => {
    const { customLink } = await import("./test.fixtures.svelte");
    const page = await render(SideNavigation, {
      root,
      footerRoot,
      link: customLink,
    });
    await expect
      .element(page.getByRole("link", { name: "Machines" }))
      .toHaveAttribute("href", "#/machines");
    await expect
      .element(page.getByRole("link", { name: "Settings" }))
      .toHaveAttribute("href", "#/settings");
  });
});
