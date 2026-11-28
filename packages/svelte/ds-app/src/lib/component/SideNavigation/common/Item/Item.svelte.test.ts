// Ported from @canonical/react-ds-app SideNavigation Item

import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import {
  customLink,
  fixtureText,
  richItem,
  slot,
} from "../../test.fixtures.svelte";
import Item from "./Item.svelte";

describe("Item", () => {
  it("renders a link when url is set", async () => {
    const page = await render(Item, { url: "/machines", children: "Machines" });
    await expect
      .element(page.getByRole("link", { name: "Machines" }))
      .toHaveAttribute("href", "/machines");
  });

  it("renders a plain label when url is absent", async () => {
    const page = await render(Item, { children: "Ada Lovelace" });
    await expect.element(page.getByRole("link")).not.toBeInTheDocument();
    await expect.element(page.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("marks the active item with aria-current", async () => {
    const page = await render(Item, {
      url: "/machines",
      active: true,
      children: "Machines",
    });
    await expect
      .element(page.getByRole("link"))
      .toHaveAttribute("aria-current", "page");
    expect(
      (page.container.firstElementChild as HTMLElement).dataset.active,
    ).toBe("true");
  });

  it("omits href when disabled", async () => {
    const page = await render(Item, {
      url: "/machines",
      disabled: true,
      children: "Machines",
    });
    // An <a> without href has no "link" role — the disabled fallback
    // renders a non-navigable element.
    await expect.element(page.getByRole("link")).not.toBeInTheDocument();
    const anchor = page.container.querySelector("a.row");
    expect(anchor).not.toBeNull();
    expect(anchor?.hasAttribute("href")).toBe(false);
    expect(
      (page.container.firstElementChild as HTMLElement).dataset.disabled,
    ).toBe("true");
  });

  it("renders the trailing slot", async () => {
    const page = await render(Item, {
      url: "/machines",
      slot,
      children: "Machines",
    });
    await expect.element(page.getByText(fixtureText.slot)).toBeInTheDocument();
  });

  it("renders the leading icon", async () => {
    const page = await render(Item, {
      url: "/machines",
      icon: "machines",
      children: "Machines",
    });
    expect(
      page.container.querySelector(".start use[href$='machines.svg#machines']"),
    ).not.toBeNull();
  });

  // React's `LinkComponent` is a component; Svelte takes a `link` snippet
  // receiving the row's attributes and content.
  it("renders through a custom link snippet", async () => {
    const page = await render(Item, {
      url: "/machines",
      link: customLink,
      children: "Machines",
    });
    const link = page.getByRole("link");
    await expect.element(link).toHaveAttribute("href", "#/machines");
    await expect.element(link).toHaveClass("row");
  });

  it("passes aria-current to the link snippet", async () => {
    const page = await render(Item, {
      url: "/machines",
      active: true,
      link: customLink,
      children: "Machines",
    });
    await expect
      .element(page.getByRole("link"))
      .toHaveAttribute("aria-current", "page");
  });

  it("applies custom class", async () => {
    const page = await render(Item, {
      url: "/machines",
      class: "custom-class",
      children: "Machines",
    });
    const element = page.container.firstElementChild as HTMLElement;
    await expect.element(element).toHaveClass("ds");
    await expect.element(element).toHaveClass("side-navigation-item");
    await expect.element(element).toHaveClass("custom-class");
  });

  it("sets title on the label as a native tooltip fallback for truncation", async () => {
    const page = await render(Item, { url: "/machines", children: "Machines" });
    await expect
      .element(page.getByText("Machines"))
      .toHaveAttribute("title", "Machines");
  });

  it("composes rich (snippet) content without setting a title", async () => {
    const page = await render(Item, { url: "/machines", children: richItem });
    const strong = page.getByText(fixtureText.richItem).element();
    expect(strong.tagName).toBe("STRONG");
    expect(strong.closest(".label")?.hasAttribute("title")).toBe(false);
  });
});
