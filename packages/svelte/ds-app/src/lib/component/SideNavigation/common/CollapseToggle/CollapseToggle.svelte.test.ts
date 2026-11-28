// Ported from @canonical/react-ds-app SideNavigation CollapseToggle

import { describe, expect, it, vi } from "vitest";
import type { RenderResult } from "vitest-browser-svelte";
import { render } from "vitest-browser-svelte";
import CollapseToggle from "./CollapseToggle.svelte";

/** The element the toggle's tooltip text lives in (no Tooltip in Svelte yet). */
function description(page: RenderResult<typeof CollapseToggle>) {
  const target = page.container.querySelector(".target") as HTMLElement;
  return document.getElementById(
    target.getAttribute("aria-describedby") ?? "",
  ) as HTMLElement;
}

describe("CollapseToggle", () => {
  it("renders a button", async () => {
    const page = await render(CollapseToggle, {});
    await expect.element(page.getByRole("button")).toBeInTheDocument();
  });

  it("reflects the expanded state via aria-expanded and label", async () => {
    const page = await render(CollapseToggle, { expanded: true });
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("aria-expanded", "true");
    await expect
      .element(page.getByRole("button", { name: "Collapse navigation" }))
      .toBeInTheDocument();

    await page.rerender({ expanded: false });
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("aria-expanded", "false");
    await expect
      .element(page.getByRole("button", { name: "Expand navigation" }))
      .toBeInTheDocument();
  });

  it("calls onclick when activated", async () => {
    const onclick = vi.fn();
    const page = await render(CollapseToggle, { onclick });
    await page.getByRole("button").click();
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("applies custom class and passes through props", async () => {
    const page = await render(CollapseToggle, {
      class: "custom-class",
      "data-testid": "toggle",
    });
    const element = page.getByTestId("toggle");
    await expect.element(element).toHaveClass("ds");
    await expect.element(element).toHaveClass("collapse-toggle");
    await expect.element(element).toHaveClass("custom-class");
  });

  it("always renders a button type, not submit", async () => {
    const page = await render(CollapseToggle, {});
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("type", "button");
  });

  it("renders the localised text from messages", async () => {
    const page = await render(CollapseToggle, {
      expanded: false,
      messages: {
        expandNavigation: () => "Développer la navigation",
        openMenu: () => "Menu FR",
        expand: () => "Développer",
      },
    });
    const button = page.getByRole("button", {
      name: "Développer la navigation",
    });
    expect(button.element().textContent).toContain("Menu FR");
    expect(description(page).textContent).toBe("Développer");
  });

  // React shows the text in a Tooltip after a 1s hover. Svelte has no
  // Tooltip yet: the same text is a hidden element the toggle's target
  // points at with aria-describedby.
  it("wires the tooltip text naming the action for each state", async () => {
    const page = await render(CollapseToggle, { expanded: true });
    expect(description(page).hidden).toBe(true);
    expect(description(page).textContent).toBe("Collapse");

    await page.rerender({ expanded: false });
    await expect.element(description(page)).toHaveTextContent("Expand");
  });

  it("keeps the same button mounted across state changes, retaining focus", async () => {
    const page = await render(CollapseToggle, { expanded: true });
    const button = page.getByRole("button").element() as HTMLButtonElement;
    button.focus();
    expect(document.activeElement).toBe(button);

    await page.rerender({ expanded: false });

    const buttonAfter = page.getByRole("button").element();
    expect(buttonAfter).toBe(button);
    expect(document.activeElement).toBe(buttonAfter);
    await expect.element(description(page)).toHaveTextContent("Expand");
  });

  // React-only: the 1s hover activation delay belongs to the Tooltip, which
  // Svelte does not have yet.
});
