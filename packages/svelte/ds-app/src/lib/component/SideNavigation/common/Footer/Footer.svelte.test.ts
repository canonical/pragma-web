// Ported from @canonical/react-ds-app SideNavigation Footer

import { describe, expect, it, vi } from "vitest";
import type { RenderResult } from "vitest-browser-svelte";
import { render } from "vitest-browser-svelte";
import { fixtureText, slot } from "../../test.fixtures.svelte";
import type { FooterRoot } from "../../types.js";
import Footer from "./Footer.svelte";

type Page = RenderResult<typeof Footer>;

const footer = (page: Page) =>
  page.container.querySelector("footer") as HTMLElement;
const details = (page: Page) =>
  page.container.querySelector("details") as HTMLDetailsElement;
const rowOf = (page: Page, name: string) =>
  page.getByRole("link", { name }).element().closest("li") as HTMLElement;
/** Clicks a link without leaving the test page. */
const clickLink = (page: Page, name: string) => {
  const link = page.getByRole("link", { name }).element() as HTMLElement;
  link.addEventListener("click", (event) => event.preventDefault());
  link.click();
};

describe("Footer", () => {
  it("applies custom class", async () => {
    const page = await render(Footer, { class: "custom-class" });
    await expect.element(footer(page)).toHaveClass("ds");
    await expect.element(footer(page)).toHaveClass("side-navigation-footer");
    await expect.element(footer(page)).toHaveClass("custom-class");
  });

  it("passes through additional props", async () => {
    const page = await render(Footer, { "data-testid": "test-component" });
    await expect
      .element(page.getByTestId("test-component"))
      .toBeInTheDocument();
  });

  it("renders an empty region with no root", async () => {
    const page = await render(Footer, {});
    expect(footer(page).children).toHaveLength(0);
  });

  describe("root (the footer's only data surface)", () => {
    const root: FooterRoot = {
      key: "footer",
      items: [
        { label: "Ada Lovelace", url: "/account" },
        { label: "Notifications", url: "/notifications", slot },
        { label: "Log out", control: "button", onclick: vi.fn() },
      ],
    };

    it("renders each item with its given label", async () => {
      const page = await render(Footer, { root });
      await expect
        .element(page.getByRole("link", { name: "Ada Lovelace" }))
        .toHaveAttribute("href", "/account");
      await expect
        .element(page.getByRole("link", { name: /^Notifications/ }))
        .toHaveAttribute("href", "/notifications");
      await expect
        .element(page.getByRole("button", { name: "Log out" }))
        .toBeInTheDocument();
    });

    it("renders navigable items as links and action items as buttons", async () => {
      const page = await render(Footer, { root });
      await expect
        .element(page.getByRole("link", { name: "Ada Lovelace" }))
        .toBeInTheDocument();
      await expect
        .element(page.getByRole("button", { name: "Log out" }))
        .toBeInTheDocument();
    });

    it("calls onclick for an action item", async () => {
      const onclick = vi.fn();
      const page = await render(Footer, {
        root: {
          key: "footer",
          items: [{ label: "Log out", control: "button", onclick }],
        },
      });
      await page.getByRole("button", { name: "Log out" }).click();
      expect(onclick).toHaveBeenCalledOnce();
    });

    it("renders an onclick item without a url as a button", async () => {
      const onclick = vi.fn();
      const page = await render(Footer, {
        root: { key: "footer", items: [{ label: "Notify", onclick }] },
      });
      await page.getByRole("button", { name: "Notify" }).click();
      expect(onclick).toHaveBeenCalledOnce();
    });

    it("renders the leading icon", async () => {
      const page = await render(Footer, {
        root: {
          key: "footer",
          items: [{ label: "Ada Lovelace", icon: "certificate" }],
        },
      });
      expect(
        page.container.querySelector(
          "use[href$='certificate.svg#certificate']",
        ),
      ).not.toBeNull();
    });

    it("renders the trailing slot", async () => {
      const page = await render(Footer, { root });
      await expect
        .element(page.getByText(fixtureText.slot))
        .toBeInTheDocument();
    });

    it("marks the active row (url matching currentUrl)", async () => {
      const page = await render(Footer, { root, currentUrl: "/account" });
      expect(rowOf(page, "Ada Lovelace").dataset.active).toBe("true");
      expect(rowOf(page, "Notifications 3").hasAttribute("data-active")).toBe(
        false,
      );
    });

    it("control: button always wins over url, even when both are given", async () => {
      const page = await render(Footer, {
        root: {
          key: "footer",
          items: [
            {
              label: "Ada Lovelace",
              url: "/account",
              control: "button",
              onclick: vi.fn(),
            },
          ],
        },
      });
      await expect
        .element(page.getByRole("button", { name: "Ada Lovelace" }))
        .toBeInTheDocument();
      await expect.element(page.getByRole("link")).not.toBeInTheDocument();
    });

    it("renders a depth-1 expandable disclosure with leaf children", async () => {
      const page = await render(Footer, {
        root: {
          key: "footer",
          items: [
            {
              label: "Theme",
              icon: "dark-theme",
              items: [
                { label: "Light", icon: "light-theme" },
                { label: "Dark", icon: "dark-theme" },
              ],
            },
          ],
        },
      });
      await expect.element(page.getByText("Theme")).toBeInTheDocument();
      expect(details(page)).not.toBeNull();
      await expect.element(page.getByText("Light")).toBeInTheDocument();
      await expect.element(page.getByText("Dark")).toBeInTheDocument();
    });

    it("marks the active leaf under its open expandable parent", async () => {
      const page = await render(Footer, {
        root: {
          key: "footer",
          items: [
            {
              label: "Theme",
              items: [{ label: "Dark", url: "/settings/appearance" }],
            },
          ],
        },
        currentUrl: "/settings/appearance",
      });
      expect(details(page).hasAttribute("open")).toBe(true);
      expect(rowOf(page, "Dark").dataset.active).toBe("true");
    });

    it("does not seed an expandable open when its label-only children match an unset currentUrl", async () => {
      const page = await render(Footer, {
        root: {
          key: "footer",
          items: [
            {
              label: "Theme",
              items: [
                { label: "Light", icon: "light-theme" },
                { label: "Dark", icon: "dark-theme" },
              ],
            },
          ],
        },
      });
      expect(details(page).hasAttribute("open")).toBe(false);
    });

    const themeRoot: FooterRoot = {
      key: "footer",
      items: [
        {
          label: "Theme",
          items: [
            { label: "Light", url: "/theme/light" },
            { label: "Log out", control: "button", onclick: vi.fn() },
          ],
        },
      ],
    };

    it("collapses the expandable when a leaf child row is activated", async () => {
      const page = await render(Footer, {
        currentUrl: "/theme/light",
        root: themeRoot,
      });
      expect(details(page).hasAttribute("open")).toBe(true);
      clickLink(page, "Light");
      expect(details(page).hasAttribute("open")).toBe(false);
    });

    it("collapses the expandable when a button child row is activated", async () => {
      const page = await render(Footer, {
        currentUrl: "/theme/light",
        root: themeRoot,
      });
      expect(details(page).hasAttribute("open")).toBe(true);
      (
        page.getByRole("button", { name: "Log out" }).element() as HTMLElement
      ).click();
      expect(details(page).hasAttribute("open")).toBe(false);
    });

    it("renders label-only rows as plain labels, not inert buttons", async () => {
      const page = await render(Footer, {
        root: {
          key: "footer",
          items: [{ label: "Ada Lovelace", icon: "user" }],
        },
      });
      await expect.element(page.getByText("Ada Lovelace")).toBeInTheDocument();
      await expect.element(page.getByRole("button")).not.toBeInTheDocument();
      await expect.element(page.getByRole("link")).not.toBeInTheDocument();
    });

    it("renders expandable children as plain (non-navigable) rows", async () => {
      const page = await render(Footer, {
        root: {
          key: "footer",
          items: [{ label: "Theme", items: [{ label: "System" }] }],
        },
      });
      await expect
        .element(page.getByText("System", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(page.getByRole("button", { name: "System" }))
        .not.toBeInTheDocument();
      await expect
        .element(page.getByRole("link", { name: "System" }))
        .not.toBeInTheDocument();
    });
  });
});
