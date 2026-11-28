// Ported from @canonical/react-ds-app SideNavigation NavTree

import { tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import type { NavRoot } from "../../types.js";
import NavTree from "./NavTree.svelte";

describe("NavTree", () => {
  it("renders a group header and its link entries", async () => {
    const root: NavRoot = {
      key: "root",
      items: [
        {
          key: "hardware",
          label: "Hardware",
          items: [{ url: "/machines", label: "Machines" }],
        },
      ],
    };
    const page = await render(NavTree, { root });
    await expect.element(page.getByText("Hardware")).toBeInTheDocument();
    await expect
      .element(page.getByRole("link", { name: "Machines" }))
      .toHaveAttribute("href", "/machines");
  });

  // React's "does not warn about React keys" cases: Svelte keys its each
  // blocks; a duplicate key throws, so rendering without errors is the check.
  it("renders keyed and key-only entries without errors", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const root: NavRoot = {
      key: "root",
      items: [
        { key: "one-group", items: [{ url: "/one", label: "One" }] },
        { key: "two-group", items: [{ url: "/two", label: "Two" }] },
        {
          key: "plain-group",
          items: [
            { key: "plain-label", label: "Plain" },
            {
              key: "expandable",
              label: "Expandable",
              items: [{ key: "child", label: "Child" }],
            },
          ],
        },
      ],
    };
    const page = await render(NavTree, { root });
    await expect.element(page.getByText("Plain")).toBeInTheDocument();
    await expect.element(page.getByText("Child")).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("renders keyless label-only entries, falling back to label then index", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const root: NavRoot = {
      key: "root",
      items: [
        {
          key: "group",
          items: [
            { label: "Anonymous One" },
            { label: "Anonymous Two" },
            { url: "/one", label: "One" },
          ],
        },
      ],
    };
    const page = await render(NavTree, { root });
    await expect.element(page.getByText("Anonymous One")).toBeInTheDocument();
    await expect.element(page.getByText("Anonymous Two")).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("renders an expandable entry as a disclosure with leaf children", async () => {
    const root: NavRoot = {
      key: "root",
      items: [
        {
          key: "main",
          items: [
            {
              key: "hardware",
              label: "Hardware",
              items: [{ url: "/machines", label: "Machines" }],
            },
          ],
        },
      ],
    };
    const page = await render(NavTree, { root });
    await expect.element(page.getByText("Hardware")).toBeInTheDocument();
    expect(page.container.querySelector("details")).not.toBeNull();
    expect(page.container.querySelector('a[href="/machines"]')).not.toBeNull();
  });

  it("marks the currentUrl entry as active", async () => {
    const root: NavRoot = {
      key: "root",
      items: [
        {
          key: "main",
          items: [
            { url: "/one", label: "One" },
            { url: "/two", label: "Two" },
          ],
        },
      ],
    };
    const page = await render(NavTree, { root, currentUrl: "/two" });
    await expect
      .element(page.getByRole("link", { name: "Two" }))
      .toHaveAttribute("aria-current", "page");
  });

  it("marks a nested sub-item active under its expanded expandable parent", async () => {
    const root: NavRoot = {
      key: "root",
      items: [
        {
          key: "main",
          items: [
            {
              key: "hardware",
              label: "Hardware",
              items: [
                { url: "/machines", label: "Machines" },
                { url: "/devices", label: "Devices" },
              ],
            },
          ],
        },
      ],
    };
    const page = await render(NavTree, { root, currentUrl: "/devices" });
    const devices = page.getByRole("link", { name: "Devices" });
    await expect.element(devices).toHaveAttribute("aria-current", "page");
    expect(devices.element().closest("li")?.getAttribute("data-active")).toBe(
      "true",
    );
    expect(
      page
        .getByRole("link", { name: "Machines" })
        .element()
        .closest("li")
        ?.hasAttribute("data-active"),
    ).toBe(false);
    expect(page.container.querySelector("details")?.hasAttribute("open")).toBe(
      true,
    );
  });

  it("re-opens the expandable parent when a nested sub-item becomes active on navigation", async () => {
    const root: NavRoot = {
      key: "root",
      items: [
        {
          key: "main",
          items: [
            { url: "/home", label: "Home" },
            {
              key: "hardware",
              label: "Hardware",
              items: [{ url: "/devices", label: "Devices" }],
            },
          ],
        },
      ],
    };
    const page = await render(NavTree, { root, currentUrl: "/home" });
    const details = page.container.querySelector(
      "details",
    ) as HTMLDetailsElement;
    expect(details.hasAttribute("open")).toBe(false);

    await page.rerender({ currentUrl: "/devices" });
    await tick();
    expect(details.hasAttribute("open")).toBe(true);
    await expect
      .element(page.getByRole("link", { name: "Devices" }))
      .toHaveAttribute("aria-current", "page");

    // Deliberately one-way: routing away does not close it.
    await page.rerender({ currentUrl: "/home" });
    await tick();
    expect(details.hasAttribute("open")).toBe(true);
  });

  it("keeps the last match when currentUrl stops matching", async () => {
    const root: NavRoot = {
      key: "root",
      items: [{ key: "main", items: [{ url: "/one", label: "One" }] }],
    };
    const page = await render(NavTree, { root, currentUrl: "/one" });
    await page.rerender({ currentUrl: "/elsewhere" });
    await tick();
    await expect
      .element(page.getByRole("link", { name: "One" }))
      .toHaveAttribute("aria-current", "page");
  });

  it("draws a divider before every group but the first, skipping empty groups", async () => {
    // Anatomy: SideNavigation.ItemGroup.
    const root: NavRoot = {
      key: "root",
      items: [
        { key: "a", items: [{ url: "/a", label: "A" }] },
        { key: "empty", label: "Empty" },
        { key: "b", items: [{ url: "/b", label: "B" }] },
        { key: "c", items: [{ url: "/c", label: "C" }] },
      ],
    };
    const page = await render(NavTree, { root });
    const groups = Array.from(
      page.container.querySelectorAll(".side-navigation-group"),
    );
    expect(groups).toHaveLength(3);
    expect(
      groups.map(
        (group) => group.querySelector(":scope > hr.divider") !== null,
      ),
    ).toEqual([false, true, true]);
    await expect.element(page.getByText("Empty")).not.toBeInTheDocument();
  });
});
