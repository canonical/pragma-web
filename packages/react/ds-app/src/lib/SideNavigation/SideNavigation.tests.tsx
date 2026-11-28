import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SideNavigation from "./SideNavigation.js";
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

describe("SideNavigation", () => {
  it("renders as a self-contained nav landmark", () => {
    render(<SideNavigation root={root} />);
    expect(
      screen.getByRole("navigation", { name: "Main navigation" }),
    ).toBeInTheDocument();
  });

  it("allows overriding the default aria-label", () => {
    render(<SideNavigation root={root} aria-label="Product navigation" />);
    expect(
      screen.getByRole("navigation", { name: "Product navigation" }),
    ).toBeInTheDocument();
  });

  it("renders its built-in text from messages, for translation", () => {
    render(
      <SideNavigation
        root={root}
        messages={{
          skipToContent: () => "Aller au contenu principal",
          navigation: () => "Navigation principale",
          collapseNavigation: () => "Réduire la navigation",
          closeMenu: () => "Fermer le menu",
        }}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Aller au contenu principal" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Navigation principale" }),
    ).toBeInTheDocument();
    const toggle = screen.getByRole("button", {
      name: "Réduire la navigation",
    });
    expect(toggle).toHaveTextContent("Fermer le menu");
  });

  it("keeps the English default for any message left out", () => {
    render(
      <SideNavigation
        root={root}
        messages={{ navigation: () => "Navigation principale" }}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Skip to main content" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Collapse navigation" }),
    ).toBeInTheDocument();
  });

  it("renders the skip link first in DOM order", () => {
    const { container } = render(<SideNavigation root={root} />);
    const first = container.firstElementChild?.firstElementChild;
    expect(first).toHaveClass("skip-link");
    expect(first).toHaveTextContent("Skip to main content");
    expect(first).toHaveAttribute("href", "#main-content");
  });

  it("points the skip link at the skipTo target", () => {
    render(<SideNavigation root={root} skipTo="#my-main" />);
    expect(screen.getByText("Skip to main content")).toHaveAttribute(
      "href",
      "#my-main",
    );
  });

  it("renders the root items in the content region", () => {
    render(<SideNavigation root={root} />);
    expect(screen.getByText("Machines")).toBeInTheDocument();
    expect(screen.getByText("Devices")).toBeInTheDocument();
  });

  it("applies the base and custom class to the root", () => {
    const { container } = render(
      <SideNavigation root={root} className="custom-class" />,
    );
    const el = container.firstElementChild;
    expect(el?.className).toContain("ds side-navigation");
    expect(el?.className).toContain("custom-class");
  });

  it("renders the brand in the header", () => {
    render(<SideNavigation root={root} brand={<span>Acme</span>} />);
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });

  it("renders the footer items when footerRoot is provided", () => {
    render(<SideNavigation root={root} footerRoot={footerRoot} />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("marks the currentUrl item as the current page", () => {
    render(<SideNavigation root={root} currentUrl="/devices" />);
    const active = screen.getByRole("link", { name: "Devices" });
    expect(active).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Machines" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("toggles expanded state (uncontrolled) and reflects it on the root", () => {
    const { container } = render(<SideNavigation root={root} />);
    const el = container.firstElementChild as HTMLElement;
    const toggle = screen.getByRole("button");
    expect(el.dataset.expanded).toBe("true");

    fireEvent.click(toggle);
    expect(el.dataset.expanded).toBe("false");

    // The attribute is the single source of truth for the rail state: no
    // collapsed class is authored on the root.
    expect(el.className).toBe("ds side-navigation");
  });

  it("wires the toggle's aria-controls to the content region", () => {
    render(<SideNavigation root={root} />);
    const toggle = screen.getByRole("button");
    const controlledId = toggle.getAttribute("aria-controls");
    expect(controlledId).toBeTruthy();
    expect(document.getElementById(controlledId as string)).toContainElement(
      screen.getByText("Machines"),
    );
  });

  it("keeps the footer's expandable sub-items in the DOM when collapsed", () => {
    // Collapse is CSS-only: the popover degradation (styles.css) shows the
    // sub-items, but the tree must render regardless so Tab navigation and
    // the accessibility tree survive.
    const footerWithExpandable: FooterRoot = {
      key: "footer",
      items: [
        {
          label: "Account",
          items: [{ label: "Profile", url: "/profile" }],
        },
      ],
    };
    render(
      <SideNavigation
        root={root}
        defaultExpanded={false}
        footerRoot={footerWithExpandable}
      />,
    );
    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
    expect(document.querySelector("details")).toBeInTheDocument();
  });

  it("marks the active footer row and opens its expandable parent", () => {
    const footerWithExpandable: FooterRoot = {
      key: "footer",
      items: [
        { label: "Settings", url: "/settings" },
        {
          label: "Account",
          items: [{ label: "Profile", url: "/profile" }],
        },
      ],
    };
    const { container } = render(
      <SideNavigation
        root={root}
        footerRoot={footerWithExpandable}
        currentUrl="/profile"
      />,
    );
    // The active leaf row is highlighted…
    expect(
      screen.getByRole("link", { name: "Profile" }).closest("li"),
    ).toHaveAttribute("data-active", "true");
    expect(
      screen.getByRole("link", { name: "Settings" }).closest("li"),
    ).not.toHaveAttribute("data-active");
    // …and its expandable parent is open (seeded from the active child).
    expect(container.querySelector("details")).toHaveAttribute("open");
  });

  // Controlled mode is not the official circuit yet — only uncontrolled is
  // supported. Kept here for when the controlled path is enabled.
  // it("calls onExpandedChange with the next state when controlled", () => {
  //   const onExpandedChange = vi.fn();
  //   render(
  //     <SideNavigation root={root} expanded onExpandedChange={onExpandedChange} />,
  //   );
  //   fireEvent.click(screen.getByRole("button"));
  //   expect(onExpandedChange).toHaveBeenCalledWith(false);
  // });

  it("collapses via the Ctrl+B shortcut by default, and keyboardShortcut: false opts out", () => {
    const { container } = render(<SideNavigation root={root} />);
    const el = container.firstElementChild as HTMLElement;
    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(el.dataset.expanded).toBe("false");
    cleanup();

    const { container: optedOut } = render(
      <SideNavigation root={root} keyboardShortcut={false} />,
    );
    const elOptedOut = optedOut.firstElementChild as HTMLElement;
    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(elOptedOut.dataset.expanded).toBe("true");
  });

  it("collapses after mount on a small viewport when defaultExpanded is left unset", async () => {
    // The expanded state renders as a fullscreen overlay below the small
    // breakpoint, so the unset default (true, desktop) must not ship as a
    // first-paint takeover on a phone. Post-mount, SSR-pure.
    const matchMediaSpy = vi
      .spyOn(window, "matchMedia")
      .mockReturnValue({ matches: true } as MediaQueryList);
    const { container } = render(<SideNavigation root={root} />);
    await waitFor(() =>
      expect(
        (container.firstElementChild as HTMLElement).dataset.expanded,
      ).toBe("false"),
    );
    matchMediaSpy.mockRestore();
  });

  it("keeps an explicit defaultExpanded on every viewport", async () => {
    const matchMediaSpy = vi
      .spyOn(window, "matchMedia")
      .mockReturnValue({ matches: true } as MediaQueryList);
    const { container } = render(
      <SideNavigation root={root} defaultExpanded />,
    );
    await waitFor(() =>
      expect(
        (container.firstElementChild as HTMLElement).dataset.expanded,
      ).toBe("true"),
    );
    matchMediaSpy.mockRestore();
  });

  it("stays expanded on a wide viewport when defaultExpanded is left unset", () => {
    const { container } = render(<SideNavigation root={root} />);
    expect((container.firstElementChild as HTMLElement).dataset.expanded).toBe(
      "true",
    );
  });

  it("responds to the collapse shortcut when keyboardShortcut is enabled", () => {
    const { container } = render(
      <SideNavigation root={root} keyboardShortcut />,
    );
    const el = container.firstElementChild as HTMLElement;
    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(el.dataset.expanded).toBe("false");
  });

  it("orders focusable elements logo → collapse toggle → content → footer", () => {
    const { container } = render(
      <SideNavigation
        root={root}
        footerRoot={footerRoot}
        brand={<a href="/">Home</a>}
      />,
    );
    const focusable = Array.from(
      container.querySelectorAll("a, button"),
    ) as HTMLElement[];
    const labels = focusable.map(
      (el) => el.getAttribute("aria-label") || el.textContent,
    );
    expect(labels).toEqual([
      "Skip to main content", // skip navigation, first in DOM order
      "Home", // brand/logo
      "Collapse navigation", // collapse toggle
      "Machines", // content, top-to-bottom
      "Devices",
      "Settings", // footer, top-to-bottom
    ]);
  });

  it("renders the ContextSwitcher inside Content, before the nav landmark", () => {
    render(
      <SideNavigation
        root={root}
        contextSwitcher={{
          currentContext: {
            key: "default",
            name: "default",
            description: "Default",
          },
          contexts: [
            { key: "default", name: "default", description: "Default" },
            { key: "staging", name: "staging", description: "Staging" },
          ],
        }}
      />,
    );
    const switcher = document.querySelector(
      ".ds.side-navigation-context-switcher",
    );
    const content = document.querySelector(".ds.side-navigation-content");
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    // Content is the region: the switcher, then the <nav> — and the switcher
    // stays outside the landmark (a select-like widget is not navigation).
    expect(content?.tagName).toBe("DIV");
    expect(Array.from(content?.children ?? [])).toEqual([switcher, nav]);
    expect(nav).not.toContainElement(switcher as HTMLElement);
    // The collapse toggle still controls the whole region.
    expect(
      screen
        .getByRole("button", { name: "Collapse navigation" })
        .getAttribute("aria-controls"),
    ).toBe(content?.id);
  });

  it("hides the ContextSwitcher with Content when collapsed", () => {
    // CSS hides Content when collapsed via the ROOT's data-expanded; the
    // switcher carries no state of its own and lives inside Content, so it
    // hides with it.
    const { container } = render(
      <SideNavigation
        root={root}
        defaultExpanded={false}
        contextSwitcher={{
          currentContext: {
            key: "default",
            name: "default",
            description: "Default",
          },
          contexts: [
            { key: "default", name: "default", description: "Default" },
          ],
        }}
      />,
    );
    const rootEl = container.firstElementChild as HTMLElement;
    expect(rootEl.dataset.expanded).toBe("false");
    const switcher = container.querySelector(
      ".ds.side-navigation-context-switcher",
    );
    expect(switcher).not.toHaveAttribute("data-expanded");
    expect(switcher?.parentElement).toHaveClass("side-navigation-content");
    expect(switcher?.parentElement?.parentElement).toBe(rootEl);
  });

  // Skipped while the divider is hidden (operator, 2026-11-28).
  it.skip("starts every group but the first with a divider", () => {
    const grouped: NavRoot = {
      key: "root",
      items: [
        { key: "a", items: [{ url: "/a", label: "A" }] },
        { key: "empty", items: [] },
        { key: "b", label: "B", items: [{ url: "/b", label: "B1" }] },
        { key: "c", items: [{ url: "/c", label: "C" }] },
      ],
    };
    const { container } = render(<SideNavigation root={grouped} />);
    const groups = container.querySelectorAll(".ds.side-navigation-group");
    // The empty group renders nothing and does not count as the first.
    expect(groups).toHaveLength(3);
    expect(groups[0].querySelector(":scope > hr")).toBeNull();
    for (const group of [groups[1], groups[2]]) {
      const divider = group.firstElementChild;
      expect(divider?.tagName).toBe("HR");
      expect(divider).toHaveClass("divider");
    }
  });

  it("always renders the footer, empty without footerRoot", () => {
    const { container } = render(<SideNavigation root={root} />);
    const rootEl = container.firstElementChild as HTMLElement;
    const footer = rootEl.lastElementChild;
    expect(footer?.tagName).toBe("FOOTER");
    expect(footer).toHaveClass("ds", "side-navigation-footer");
    expect(footer?.childElementCount).toBe(0);
    // Skip link, header, content, footer: one of each region.
    expect(rootEl.children).toHaveLength(4);
  });
});
