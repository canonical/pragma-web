import type { ComponentProps } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Component from "./SegmentedControl.svelte";

describe("SegmentedControl component", () => {
  const items = [
    {
      label: "My direct reports",
      value: "direct",
      id: "direct-tab",
      ariaControls: "direct-panel",
    },
    { label: "Unavailable view", value: "unavailable", disabled: true },
    { label: "My span of control", value: "span" },
  ];
  const baseProps = {
    "aria-label": "Directory scope",
    "data-testid": "segmented-control",
    items,
    value: "direct",
  } satisfies ComponentProps<typeof Component>;

  it("renders an accessible tablist and its items", async () => {
    const page = await render(Component, { ...baseProps });
    const tablist = page.getByRole("tablist", { name: "Directory scope" });

    await expect.element(tablist).toBeInTheDocument();
    expect(tablist.element().querySelectorAll('[role="tab"]')).toHaveLength(3);
  });

  it("applies base and custom classes and passes through attributes", async () => {
    const page = await render(Component, {
      ...baseProps,
      class: "custom",
    });

    await expect
      .element(page.getByTestId("segmented-control"))
      .toHaveClass("ds", "segmented-control", "custom");
  });

  it("marks only the selected item as selected and tabbable", async () => {
    const page = await render(Component, { ...baseProps });
    const selected = page.getByRole("tab", { name: "My direct reports" });
    const unselected = page.getByRole("tab", {
      name: "My span of control",
    });

    await expect.element(selected).toHaveAttribute("aria-selected", "true");
    await expect.element(selected).toHaveAttribute("tabindex", "0");
    await expect.element(unselected).toHaveAttribute("aria-selected", "false");
    await expect.element(unselected).toHaveAttribute("tabindex", "-1");
  });

  it("updates selection and calls onValueChange", async () => {
    const onValueChange = vi.fn();
    const page = await render(Component, {
      ...baseProps,
      onValueChange,
    });
    const next = page.getByRole("tab", { name: "My span of control" });

    await next.click();

    await expect.element(next).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).toHaveBeenCalledWith("span", items[2]);
  });

  it("moves selection with arrow keys, wraps, and skips disabled items", async () => {
    const onValueChange = vi.fn();
    const page = await render(Component, {
      ...baseProps,
      onValueChange,
    });
    const direct = page.getByRole("tab", { name: "My direct reports" });
    const span = page.getByRole("tab", { name: "My span of control" });

    direct.element().focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(span).toHaveFocus();
    await expect.element(span).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowRight}");
    await expect.element(direct).toHaveFocus();
    expect(onValueChange).toHaveBeenNthCalledWith(1, "span", items[2]);
    expect(onValueChange).toHaveBeenNthCalledWith(2, "direct", items[0]);
  });

  it.each(["altKey", "ctrlKey", "metaKey", "shiftKey"] as const)(
    "leaves navigation keys with $0 to the browser",
    async (modifier) => {
      const onValueChange = vi.fn();
      const page = await render(Component, { ...baseProps, onValueChange });
      const direct = page.getByRole("tab", { name: "My direct reports" });
      direct.element().focus();

      for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"]) {
        const event = new KeyboardEvent("keydown", {
          key,
          [modifier]: true,
          bubbles: true,
          cancelable: true,
        });
        direct.element().dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
      }

      await expect.element(direct).toHaveFocus();
      await expect.element(direct).toHaveAttribute("aria-selected", "true");
      expect(onValueChange).not.toHaveBeenCalled();
    },
  );

  it.each(["ArrowLeft", "ArrowRight"] as const)(
    "moves in the visual direction with %s in RTL, wraps, and skips disabled items",
    async (key) => {
      const page = await render(Component, {
        ...baseProps,
        dir: "rtl",
        items: [...items, { label: "All reports", value: "all" }],
      });
      const direct = page.getByRole("tab", { name: "My direct reports" });
      direct.element().focus();
      const targets =
        key === "ArrowLeft"
          ? ["My span of control", "All reports", "My direct reports"]
          : ["All reports", "My span of control", "My direct reports"];

      for (const name of targets) {
        await userEvent.keyboard(`{${key}}`);

        const target = page.getByRole("tab", { name });
        await expect.element(target).toHaveFocus();
        await expect.element(target).toHaveAttribute("aria-selected", "true");
      }
    },
  );

  it("moves to the first and last enabled items with Home and End", async () => {
    const page = await render(Component, { ...baseProps });
    const direct = page.getByRole("tab", { name: "My direct reports" });
    const span = page.getByRole("tab", { name: "My span of control" });

    direct.element().focus();
    await userEvent.keyboard("{End}");
    await expect.element(span).toHaveFocus();

    await userEvent.keyboard("{Home}");
    await expect.element(direct).toHaveFocus();
  });

  it("wraps backwards with ArrowLeft and skips disabled items", async () => {
    const page = await render(Component, { ...baseProps });
    const direct = page.getByRole("tab", { name: "My direct reports" });
    const span = page.getByRole("tab", { name: "My span of control" });
    direct.element().focus();

    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(span).toHaveFocus();
    await expect.element(span).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(direct).toHaveFocus();
  });

  it("keeps only the selected enabled tab in the Tab sequence", async () => {
    const page = await render(Component, { ...baseProps });
    const direct = page.getByRole("tab", { name: "My direct reports" });
    const tablist = page.getByRole("tablist");
    direct.element().focus();

    await userEvent.keyboard("{Tab}");
    expect(tablist.element().contains(document.activeElement)).toBe(false);
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.element(direct).toHaveFocus();
  });

  it("does not select a disabled item or repeat the current selection callback", async () => {
    const onValueChange = vi.fn();
    const page = await render(Component, { ...baseProps, onValueChange });
    (
      page
        .getByRole("tab", { name: "Unavailable view" })
        .element() as HTMLButtonElement
    ).click();
    await page.getByRole("tab", { name: "My direct reports" }).click();

    expect(onValueChange).not.toHaveBeenCalled();
    await expect
      .element(page.getByRole("tab", { name: "My direct reports" }))
      .toHaveAttribute("aria-selected", "true");
  });

  it("updates selection when the consumer changes value", async () => {
    const page = await render(Component, { ...baseProps });
    await page.rerender({ value: "span" });

    await expect
      .element(page.getByRole("tab", { name: "My span of control" }))
      .toHaveAttribute("aria-selected", "true");
    await expect
      .element(page.getByRole("tab", { name: "My direct reports" }))
      .toHaveAttribute("tabindex", "-1");
  });

  it("exposes disabled and tab-panel relationships", async () => {
    const page = await render(Component, { ...baseProps });
    const direct = page.getByRole("tab", { name: "My direct reports" });
    const disabled = page.getByRole("tab", { name: "Unavailable view" });

    await expect.element(direct).toHaveAttribute("id", "direct-tab");
    await expect
      .element(direct)
      .toHaveAttribute("aria-controls", "direct-panel");
    await expect.element(disabled).toBeDisabled();
    await expect.element(disabled).toHaveAttribute("tabindex", "-1");
  });
});
