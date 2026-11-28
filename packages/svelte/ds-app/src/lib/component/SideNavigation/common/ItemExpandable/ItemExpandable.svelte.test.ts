// Ported from @canonical/react-ds-app SideNavigation ItemExpandable

import { tick } from "svelte";
import { describe, expect, it } from "vitest";
import type { RenderResult } from "vitest-browser-svelte";
import { render } from "vitest-browser-svelte";
import {
  expandableChildren,
  linkAndButtonChildren,
  linkChildren,
  packagesChildren,
  plainLabelChildren,
} from "../../test.fixtures.svelte";
import ItemExpandable from "./ItemExpandable.svelte";
import css from "./styles.css?raw";

type Page = RenderResult<typeof ItemExpandable>;

const details = (page: Page) =>
  page.container.querySelector("details") as HTMLDetailsElement;
const summary = (page: Page) =>
  page.container.querySelector("summary") as HTMLElement;

describe("ItemExpandable", () => {
  it("renders the heading and, when expanded, its children", async () => {
    const page = await render(ItemExpandable, {
      heading: "Hardware",
      defaultExpanded: true,
      children: expandableChildren,
    });
    await expect.element(page.getByText("Hardware")).toBeVisible();
    await expect.element(page.getByText("Machines")).toBeVisible();
  });

  it("starts closed by default", async () => {
    const page = await render(ItemExpandable, {
      heading: "Hardware",
      children: expandableChildren,
    });
    expect(details(page).hasAttribute("open")).toBe(false);
  });

  it("starts open when defaultExpanded is set", async () => {
    const page = await render(ItemExpandable, {
      heading: "Hardware",
      defaultExpanded: true,
      children: expandableChildren,
    });
    expect(details(page).hasAttribute("open")).toBe(true);
  });

  it("toggles open/closed when the summary is activated", async () => {
    const page = await render(ItemExpandable, {
      heading: "Hardware",
      children: expandableChildren,
    });
    expect(details(page).hasAttribute("open")).toBe(false);
    summary(page).click();
    expect(details(page).hasAttribute("open")).toBe(true);
    summary(page).click();
    expect(details(page).hasAttribute("open")).toBe(false);
  });

  it("ignores toggling when disabled", async () => {
    const page = await render(ItemExpandable, {
      heading: "Hardware",
      disabled: true,
      children: expandableChildren,
    });
    const item = page.container.firstElementChild as HTMLElement;
    expect(item.hasAttribute("data-disabled")).toBe(true);
    summary(page).click();
    expect(details(page).hasAttribute("open")).toBe(false);
  });

  it("re-opens when the defaultExpanded seed flips true on a mounted instance", async () => {
    const page = await render(ItemExpandable, {
      heading: "Hardware",
      children: expandableChildren,
    });
    expect(details(page).hasAttribute("open")).toBe(false);

    await page.rerender({ defaultExpanded: true });
    await tick();
    expect(details(page).hasAttribute("open")).toBe(true);
  });

  it("respects a manual collapse: the disclosure never re-opens while the seed is unchanged", async () => {
    const page = await render(ItemExpandable, {
      heading: "Hardware",
      defaultExpanded: true,
      children: expandableChildren,
    });
    summary(page).click();
    expect(details(page).hasAttribute("open")).toBe(false);

    await page.rerender({ defaultExpanded: true });
    await tick();
    expect(details(page).hasAttribute("open")).toBe(false);
  });

  it("does not force-close when the seed flips back to false (never auto-closes)", async () => {
    const page = await render(ItemExpandable, {
      heading: "Hardware",
      defaultExpanded: true,
      children: expandableChildren,
    });
    expect(details(page).hasAttribute("open")).toBe(true);

    await page.rerender({ defaultExpanded: false });
    await tick();
    expect(details(page).hasAttribute("open")).toBe(true);
  });

  it("collapses when a child row is activated (collapseOnChildClick)", async () => {
    const page = await render(ItemExpandable, {
      heading: "User",
      defaultExpanded: true,
      collapseOnChildClick: true,
      children: linkAndButtonChildren,
    });
    expect(details(page).hasAttribute("open")).toBe(true);

    const link = page.getByRole("link", { name: "Profile" }).element();
    // Keep the test page in place: the click is what matters, not navigation.
    link.addEventListener("click", (event) => event.preventDefault());
    (link as HTMLElement).click();
    expect(details(page).hasAttribute("open")).toBe(false);

    details(page).open = true;
    (
      page.getByRole("button", { name: "Log out" }).element() as HTMLElement
    ).click();
    expect(details(page).hasAttribute("open")).toBe(false);
  });

  it("does not collapse on child-row clicks without collapseOnChildClick", async () => {
    const page = await render(ItemExpandable, {
      heading: "Hardware",
      defaultExpanded: true,
      children: linkChildren,
    });
    const link = page.getByRole("link", { name: "Machines" }).element();
    link.addEventListener("click", (event) => event.preventDefault());
    (link as HTMLElement).click();
    expect(details(page).hasAttribute("open")).toBe(true);
  });

  it("collapses only for row activations, not clicks elsewhere in the panel", async () => {
    const page = await render(ItemExpandable, {
      heading: "User",
      defaultExpanded: true,
      collapseOnChildClick: true,
      children: plainLabelChildren,
    });
    (page.getByText("Plain label").element() as HTMLElement).click();
    expect(details(page).hasAttribute("open")).toBe(true);
  });

  it("applies custom class", async () => {
    const page = await render(ItemExpandable, {
      heading: "Hardware",
      class: "custom-class",
    });
    const element = page.container.firstElementChild as HTMLElement;
    await expect.element(element).toHaveClass("ds");
    await expect
      .element(element)
      .toHaveClass("side-navigation-item-expandable");
    await expect.element(element).toHaveClass("custom-class");
  });

  it("sets title on the heading as a native tooltip fallback", async () => {
    const page = await render(ItemExpandable, { heading: "Hardware" });
    await expect
      .element(page.getByText("Hardware"))
      .toHaveAttribute("title", "Hardware");
  });

  it("gates the caret's rotation transition behind prefers-reduced-motion", () => {
    const mediaBlockStart = css.indexOf(
      "@media (prefers-reduced-motion: no-preference)",
    );
    expect(mediaBlockStart).toBeGreaterThan(-1);
    const transitionIndex = css.indexOf("transition: transform");
    expect(transitionIndex).toBeGreaterThan(mediaBlockStart);
  });

  it("wires the children panel to the summary with unique anchor names (CSS anchor positioning)", async () => {
    const first = await render(ItemExpandable, {
      heading: "Hardware",
      children: expandableChildren,
    });
    const second = await render(ItemExpandable, {
      heading: "Software",
      children: packagesChildren,
    });
    const pages = [first, second];
    const names = pages.map((page) =>
      summary(page).style.getPropertyValue("anchor-name"),
    );
    const targets = pages.map((page) =>
      (
        page.container.querySelector(".children") as HTMLElement
      ).style.getPropertyValue("position-anchor"),
    );

    // Engines without anchor positioning drop the declarations; the
    // attribute still carries them.
    const fromAttribute = (element: Element, property: string) =>
      (element.getAttribute("style") ?? "").match(
        new RegExp(`${property}:\\s*(--[\\w-]+)`),
      )?.[1];
    const attributeNames = pages.map((page) =>
      fromAttribute(summary(page), "anchor-name"),
    );
    const attributeTargets = pages.map((page) =>
      fromAttribute(
        page.container.querySelector(".children") as Element,
        "position-anchor",
      ),
    );

    expect(attributeTargets).toEqual(attributeNames);
    for (const name of attributeNames) {
      expect(name).toMatch(/^--sidenav-expandable-[a-zA-Z0-9]+$/);
    }
    expect(new Set(attributeNames).size).toBe(2);
    if (names.every(Boolean)) expect(targets).toEqual(names);
  });
});
