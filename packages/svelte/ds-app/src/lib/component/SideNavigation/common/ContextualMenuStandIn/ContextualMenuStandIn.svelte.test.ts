import { tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { render } from "vitest-browser-svelte";
import ContextualMenuStandIn from "./ContextualMenuStandIn.svelte";
import { items, row, trigger } from "./test.fixtures.svelte";

type Page = RenderResult<typeof ContextualMenuStandIn>;

const triggerOf = (page: Page) =>
  page.container.querySelector(".trigger") as HTMLButtonElement;
const surface = (page: Page) =>
  page.container.querySelector('[role="menu"]') as HTMLElement;
const rows = (page: Page) =>
  Array.from(page.container.querySelectorAll<HTMLElement>('[role="menuitem"]'));
const press = (key: string) => userEvent.keyboard(`{${key}}`);

const renderMenu = (props: Record<string, unknown> = {}) =>
  render(ContextualMenuStandIn, { items, row, children: trigger, ...props });

describe("ContextualMenuStandIn", () => {
  it("renders React ContextualMenu's markup, closed", async () => {
    const page = await renderMenu();
    const button = triggerOf(page);
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("aria-haspopup")).toBe("menu");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe(surface(page).id);
    expect(button.id).toBe(`${surface(page).id}-trigger`);
    expect(surface(page).getAttribute("aria-labelledby")).toBe(button.id);
    expect(surface(page).getAttribute("aria-hidden")).toBe("true");
    expect(surface(page).getAttribute("aria-orientation")).toBe("vertical");
    expect(rows(page)).toHaveLength(3);
    expect(rows(page).every((item) => item.tabIndex === -1)).toBe(true);
    expect(page.container.querySelectorAll("hr.separator")).toHaveLength(1);
    await expect.element(surface(page)).not.toBeVisible();
  });

  it("opens on click and focuses the first row", async () => {
    const page = await renderMenu();
    await userEvent.click(triggerOf(page));
    await expect.element(surface(page)).toHaveAttribute("aria-hidden", "false");
    expect(triggerOf(page).getAttribute("aria-expanded")).toBe("true");
    await expect.poll(() => document.activeElement).toBe(rows(page)[0]);
    expect(rows(page)[0].tabIndex).toBe(0);
  });

  it("closes on a second trigger click", async () => {
    const page = await renderMenu();
    await userEvent.click(triggerOf(page));
    await userEvent.click(triggerOf(page));
    await expect.element(surface(page)).toHaveAttribute("aria-hidden", "true");
  });

  it("opens with ArrowDown on the trigger and focuses the first row", async () => {
    const page = await renderMenu();
    triggerOf(page).focus();
    await press("ArrowDown");
    await expect.poll(() => document.activeElement).toBe(rows(page)[0]);
  });

  it("moves focus with ArrowUp/ArrowDown, wrapping, and Home/End", async () => {
    const page = await renderMenu();
    await userEvent.click(triggerOf(page));
    await expect.poll(() => document.activeElement).toBe(rows(page)[0]);

    await press("ArrowDown");
    await expect.poll(() => document.activeElement).toBe(rows(page)[1]);
    await press("ArrowDown");
    await expect.poll(() => document.activeElement).toBe(rows(page)[2]);
    await press("ArrowDown");
    await expect.poll(() => document.activeElement).toBe(rows(page)[0]);
    await press("ArrowUp");
    await expect.poll(() => document.activeElement).toBe(rows(page)[2]);
    await press("Home");
    await expect.poll(() => document.activeElement).toBe(rows(page)[0]);
    await press("End");
    await expect.poll(() => document.activeElement).toBe(rows(page)[2]);
  });

  it("selects with Enter and with Space, then closes and refocuses the trigger", async () => {
    const onselect = vi.fn();
    const page = await renderMenu({ onselect });
    await userEvent.click(triggerOf(page));
    await expect.poll(() => document.activeElement).toBe(rows(page)[0]);
    await press("Enter");
    expect(onselect).toHaveBeenLastCalledWith("one");
    await expect.element(surface(page)).toHaveAttribute("aria-hidden", "true");
    expect(document.activeElement).toBe(triggerOf(page));

    await userEvent.click(triggerOf(page));
    await expect.poll(() => document.activeElement).toBe(rows(page)[0]);
    await press("ArrowDown");
    await expect.poll(() => document.activeElement).toBe(rows(page)[1]);
    await press(" ");
    expect(onselect).toHaveBeenLastCalledWith("two");
  });

  it("selects on click", async () => {
    const onselect = vi.fn();
    const page = await renderMenu({ onselect });
    await userEvent.click(triggerOf(page));
    await userEvent.click(rows(page)[2]);
    expect(onselect).toHaveBeenCalledWith("three");
    await expect.element(surface(page)).toHaveAttribute("aria-hidden", "true");
  });

  it("closes on Escape and refocuses the trigger", async () => {
    const page = await renderMenu();
    await userEvent.click(triggerOf(page));
    await expect.poll(() => document.activeElement).toBe(rows(page)[0]);
    await press("Escape");
    await expect.element(surface(page)).toHaveAttribute("aria-hidden", "true");
    expect(document.activeElement).toBe(triggerOf(page));
  });

  it("closes on Tab", async () => {
    const page = await renderMenu();
    await userEvent.click(triggerOf(page));
    await expect.poll(() => document.activeElement).toBe(rows(page)[0]);
    await press("Tab");
    await expect.element(surface(page)).toHaveAttribute("aria-hidden", "true");
  });

  it("closes on a pointerdown outside it", async () => {
    const page = await renderMenu();
    await userEvent.click(triggerOf(page));
    await expect.element(surface(page)).toHaveAttribute("aria-hidden", "false");
    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true }),
    );
    await expect.element(surface(page)).toHaveAttribute("aria-hidden", "true");
  });

  it("stays open on a pointerdown inside it", async () => {
    const page = await renderMenu();
    await userEvent.click(triggerOf(page));
    rows(page)[1].dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true }),
    );
    await tick();
    expect(surface(page).getAttribute("aria-hidden")).toBe("false");
  });

  it("reports open changes through onopenchange", async () => {
    const onopenchange = vi.fn();
    const page = await renderMenu({ onopenchange });
    await userEvent.click(triggerOf(page));
    expect(onopenchange).toHaveBeenLastCalledWith(true);
    await expect.poll(() => document.activeElement).toBe(rows(page)[0]);
    await press("Escape");
    expect(onopenchange).toHaveBeenLastCalledWith(false);
    expect(onopenchange).toHaveBeenCalledTimes(2);
  });

  it("opens from the open prop", async () => {
    const page = await renderMenu({ open: true });
    expect(surface(page).getAttribute("aria-hidden")).toBe("false");
    await page.rerender({ open: false });
    await expect.element(surface(page)).toHaveAttribute("aria-hidden", "true");
  });

  it("applies maxWidth and passes attributes to the root", async () => {
    const page = await renderMenu({
      maxWidth: "10rem",
      class: "custom-class",
      "data-testid": "menu",
    });
    const root = page.getByTestId("menu");
    await expect.element(root).toHaveClass("ds");
    await expect.element(root).toHaveClass("contextual-menu");
    await expect.element(root).toHaveClass("custom-class");
    expect(surface(page).style.maxWidth).toBe("10rem");
  });
});
