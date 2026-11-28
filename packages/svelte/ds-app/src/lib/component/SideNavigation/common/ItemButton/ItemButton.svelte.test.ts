// Ported from @canonical/react-ds-app SideNavigation ItemButton

import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { fixtureText, slot } from "../../test.fixtures.svelte";
import ItemButton from "./ItemButton.svelte";

describe("ItemButton", () => {
  it("renders a button with the label", async () => {
    const page = await render(ItemButton, { children: "Log out" });
    await expect
      .element(page.getByRole("button", { name: "Log out" }))
      .toBeInTheDocument();
  });

  it("calls onclick when activated", async () => {
    const onclick = vi.fn();
    const page = await render(ItemButton, { onclick, children: "Log out" });
    await page.getByRole("button").click();
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("supports the native disabled attribute", async () => {
    const page = await render(ItemButton, {
      disabled: true,
      children: "Log out",
    });
    await expect.element(page.getByRole("button")).toBeDisabled();
  });

  it("renders the trailing slot", async () => {
    const page = await render(ItemButton, {
      slot,
      children: "Notifications",
    });
    await expect.element(page.getByText(fixtureText.slot)).toBeInTheDocument();
  });

  it("always renders a button type, not submit", async () => {
    const page = await render(ItemButton, { children: "Log out" });
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("type", "button");
  });

  it("applies the class to the row's list item", async () => {
    const page = await render(ItemButton, {
      class: "custom-class",
      children: "Log out",
    });
    const item = page.container.firstElementChild as HTMLElement;
    expect(item.tagName).toBe("LI");
    await expect.element(item).toHaveClass("side-navigation-item-button");
    await expect.element(item).toHaveClass("custom-class");
  });
});
