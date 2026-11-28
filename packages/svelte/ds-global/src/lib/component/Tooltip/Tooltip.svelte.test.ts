import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Tooltip from "./Tooltip.svelte";
import { content, contentText, icon } from "./test.fixtures.svelte";

describe("Tooltip component", () => {
  it("renders with children", async () => {
    await render(Tooltip, { children: content });
    expect(document.body.textContent).toContain(contentText);
  });

  it("applies the correct CSS classes", async () => {
    await render(Tooltip, { children: content, isOpen: true });
    const tooltip = page.getByRole("tooltip");
    await expect.element(tooltip).toHaveClass("ds", "tooltip");
    // The colours are bound directly, not through the contrasted surface.
    await expect.element(tooltip).not.toHaveClass("contrasted");
  });

  it("applies additional classes", async () => {
    await render(Tooltip, {
      children: content,
      isOpen: true,
      class: "class1 class2",
    });
    await expect
      .element(page.getByRole("tooltip"))
      .toHaveClass("ds", "tooltip", "class1", "class2");
  });

  it("applies style", async () => {
    await render(Tooltip, {
      children: content,
      isOpen: true,
      style: "background-color: red;",
    });
    await expect
      .element(page.getByRole("tooltip"))
      .toHaveStyle("background-color: rgb(255, 0, 0)");
  });

  it("applies id", async () => {
    await render(Tooltip, { children: content, isOpen: true, id: "test-id" });
    await expect
      .element(page.getByRole("tooltip"))
      .toHaveAttribute("id", "test-id");
  });

  it("sets aria-hidden to true and hides when closed", async () => {
    const { container } = await render(Tooltip, {
      children: content,
      isOpen: false,
    });
    const tooltip = container.querySelector("[role='tooltip']");
    expect(tooltip).toHaveAttribute("aria-hidden", "true");
    expect(tooltip).not.toBeVisible();
  });

  it("sets aria-hidden to false and shows when open", async () => {
    await render(Tooltip, { children: content, isOpen: true });
    const tooltip = page.getByRole("tooltip");
    await expect.element(tooltip).toHaveAttribute("aria-hidden", "false");
    await expect.element(tooltip).toBeVisible();
  });

  it("applies zIndex", async () => {
    await render(Tooltip, { children: content, isOpen: true, zIndex: 100 });
    await expect.element(page.getByRole("tooltip")).toHaveStyle("z-index: 100");
  });

  it("calls onpointerenter when the pointer enters", async () => {
    const onpointerenter = vi.fn();
    const { container } = await render(Tooltip, {
      children: content,
      isOpen: true,
      onpointerenter,
    });
    container
      .querySelector("[role='tooltip']")
      ?.dispatchEvent(new PointerEvent("pointerenter"));
    expect(onpointerenter).toHaveBeenCalled();
  });

  it("calls onfocus when focused", async () => {
    const onfocus = vi.fn();
    const { container } = await render(Tooltip, {
      children: content,
      isOpen: true,
      onfocus,
    });
    container
      .querySelector("[role='tooltip']")
      ?.dispatchEvent(new FocusEvent("focus"));
    expect(onfocus).toHaveBeenCalled();
  });

  it("renders a decorative leading icon before the text", async () => {
    const { container } = await render(Tooltip, {
      children: content,
      icon,
      isOpen: true,
    });
    const row = container.querySelector(".content");
    expect(row?.firstElementChild).toHaveClass("icon");
    expect(row?.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(row?.lastElementChild).toHaveClass("text");
  });

  it("binds the anatomy's colours and border directly", async () => {
    const { container } = await render(Tooltip, {
      children: content,
      isOpen: true,
      style:
        "--color-background-container: rgb(1, 2, 3); --color-text: rgb(4, 5, 6); --color-border-muted: rgb(7, 8, 9); --surface-color-background: rgb(9, 9, 9);",
    });
    const style = getComputedStyle(
      container.querySelector("[role='tooltip']") as Element,
    );
    expect(style.backgroundColor).toBe("rgb(1, 2, 3)");
    expect(style.color).toBe("rgb(4, 5, 6)");
    expect(style.borderTopColor).toBe("rgb(7, 8, 9)");
  });
});
