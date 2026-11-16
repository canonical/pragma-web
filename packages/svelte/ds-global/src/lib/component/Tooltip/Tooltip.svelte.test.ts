import type { ComponentProps } from "svelte";
import { describe, expect, it } from "vitest";
import type { Locator } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { render } from "vitest-browser-svelte";
import Component from "./Tooltip.svelte";
import {
  children,
  childrenLabel,
  icon,
  iconLabel,
} from "./test.fixtures.svelte";

describe("Tooltip component", () => {
  const baseProps = { children } satisfies ComponentProps<typeof Component>;

  describe("attributes", () => {
    it.each([
      ["id", "test-id"],
      ["aria-label", "test-aria-label"],
    ])("applies %s", async (attribute, expected) => {
      const page = await render(Component, {
        ...baseProps,
        [attribute]: expected,
      });
      await expect
        .element(componentLocator(page, true))
        .toHaveAttribute(attribute, expected);
    });

    it("applies classes", async () => {
      const page = await render(Component, {
        ...baseProps,
        class: "test-class",
      });
      const tooltip = componentLocator(page, true);
      await expect.element(tooltip).toHaveClass("test-class");
      await expect.element(tooltip).toHaveClass("ds");
      await expect.element(tooltip).toHaveClass("tooltip");
    });

    it("applies style", async () => {
      const page = await render(Component, {
        ...baseProps,
        style: "color: orange;",
      });
      await expect
        .element(componentLocator(page, true))
        .toHaveStyle({ color: "orange" });
    });
  });

  describe("renders", () => {
    it("tooltip content when open", async () => {
      const page = await render(Component, { ...baseProps, isOpen: true });
      const tooltip = componentLocator(page);
      await expect.element(tooltip).toBeVisible();
      await expect.element(tooltip).toHaveTextContent(childrenLabel);
    });

    it("not visible by default", async () => {
      const page = await render(Component, { ...baseProps });
      const tooltip = componentLocator(page, true);
      await expect.element(tooltip).not.toBeVisible();
    });

    it("icon", async () => {
      const page = await render(Component, {
        ...baseProps,
        icon,
        isOpen: true,
      });
      const tooltip = componentLocator(page);
      await expect.element(tooltip.getByText(iconLabel)).toBeInTheDocument();
    });

    it.each([
      ["left", "right"],
      ["right", "left"],
      ["up", "bottom"],
      ["down", "top"],
    ] as const)("arrow pointing %s", async (arrow, placement) => {
      const page = await render(Component, {
        ...baseProps,
        arrow,
        isOpen: true,
      });
      await expect
        .element(componentLocator(page))
        .toHaveAttribute("data-placement", placement);
    });
  });
});

function componentLocator(
  page: RenderResult<typeof Component>,
  includeHidden?: boolean,
): Locator {
  return page.getByRole("tooltip", { includeHidden });
}
