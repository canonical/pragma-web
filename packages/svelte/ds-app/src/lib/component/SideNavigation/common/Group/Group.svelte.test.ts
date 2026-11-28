// Ported from @canonical/react-ds-app SideNavigation Group

import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import { groupChildren } from "../../test.fixtures.svelte";
import Group from "./Group.svelte";

describe("Group", () => {
  it("renders its children in a list", async () => {
    const page = await render(Group, { children: groupChildren });
    await expect.element(page.getByText("Machines")).toBeInTheDocument();
    expect(page.container.querySelector("ul.list > li")).not.toBeNull();
  });

  it("renders a GroupHeader when label is set", async () => {
    const page = await render(Group, {
      label: "Hardware",
      children: groupChildren,
    });
    await expect.element(page.getByText("Hardware")).toBeInTheDocument();
  });

  it("omits the header when label is absent", async () => {
    const page = await render(Group, { children: groupChildren });
    expect(
      page.container.querySelector(".ds.side-navigation-group-header"),
    ).toBeNull();
  });

  it("applies the base and custom class", async () => {
    const page = await render(Group, { class: "custom-class" });
    const element = page.container.firstElementChild as HTMLElement;
    await expect.element(element).toHaveClass("ds");
    await expect.element(element).toHaveClass("side-navigation-group");
    await expect.element(element).toHaveClass("custom-class");
  });

  // Skipped while the divider is hidden (operator, 2026-11-28).
  it.skip("starts with a divider when divider is set, before the header", async () => {
    // The anatomy (SideNavigation.ItemGroup) draws a divider before every
    // group except the first.
    const page = await render(Group, {
      label: "Hardware",
      divider: true,
      children: groupChildren,
    });
    const section = page.container.firstElementChild as HTMLElement;
    expect(section.firstElementChild?.tagName).toBe("HR");
    expect(section.firstElementChild?.classList.contains("divider")).toBe(true);
  });

  it("renders no divider by default", async () => {
    const page = await render(Group, { children: groupChildren });
    expect(page.container.querySelector("hr")).toBeNull();
  });
});
