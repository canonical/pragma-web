/* @canonical/generator-ds 0.17.1 */

import type { ComponentProps } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type Locator, userEvent } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { render } from "vitest-browser-svelte";
import Component from "./TooltipEngine.svelte";
import {
  children,
  childrenLabel,
  icon,
  iconLabel,
  trigger,
  triggerLabel,
} from "./test.fixtures.svelte";
import type { ChainingManager } from "./utils/index.js";

vi.mock("./utils/ChainingManager.js", async (importActual) => {
  const { ChainingManager: OriginalChainingManager } = await importActual<{
    ChainingManager: typeof ChainingManager;
  }>();

  let manager = new OriginalChainingManager(350);

  beforeEach(() => {
    manager = new OriginalChainingManager(350);
  });

  class Mock implements Pick<ChainingManager, keyof ChainingManager> {
    get chaining() {
      return manager.chaining;
    }

    acquire() {
      return manager.acquire();
    }
  }

  return {
    ChainingManager: Mock,
  };
});

describe("TooltipEngine component", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const baseProps = {
    children: trigger,
    message: children,
  } satisfies ComponentProps<typeof Component>;

  it("renders", async () => {
    const page = await render(Component, { ...baseProps });
    await expect.element(componentLocator(page, true)).toBeInTheDocument();
  });

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
      await expect
        .element(componentLocator(page, true))
        .toHaveClass("test-class");
      await expect.element(componentLocator(page, true)).toHaveClass("ds");
      await expect.element(componentLocator(page, true)).toHaveClass("tooltip");
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

    it("applies z-index", async () => {
      const page = await render(Component, { ...baseProps, zIndex: 100 });
      await expect
        .element(componentLocator(page, true))
        .toHaveStyle({ zIndex: "100" });
    });
  });

  describe("Applies aria-describedby to trigger", () => {
    it("if id not provided", async () => {
      const page = await render(Component, { ...baseProps });
      const button = page.getByRole("button", { name: triggerLabel });
      const tooltip = page.getByRole("tooltip", { includeHidden: true });
      await expect
        .element(button)
        .toHaveAttribute(
          "aria-describedby",
          tooltip.element().getAttribute("id"),
        );
    });

    it("if id is provided", async () => {
      const page = await render(Component, { id: "test-id", ...baseProps });
      const button = page.getByRole("button", { name: triggerLabel });
      await expect
        .element(button)
        .toHaveAttribute("aria-describedby", "test-id");
    });
  });

  describe("is shown", () => {
    // Seems like `button.hover()` is very flaky in firefox, so it needs some retries. If this is really bad, maybe we should skip hover tests in firefox altogether?
    it("on trigger hover", { retry: 3 }, async () => {
      const page = await render(Component, {
        ...baseProps,
        activateDelay: 0,
        deactivateDelay: 0,
      });
      const button = page.getByRole("button", { name: triggerLabel });
      await expect
        .element(page.getByRole("tooltip", { includeHidden: true }))
        .not.toBeVisible();
      await button.hover();
      await expect.element(page.getByRole("tooltip")).toBeVisible();
      await button.unhover();
      await expect
        .element(page.getByRole("tooltip", { includeHidden: true }))
        .not.toBeVisible();
    });

    it("on trigger focus", async () => {
      const page = await render(Component, {
        ...baseProps,
        activateDelay: 0,
        deactivateDelay: 0,
      });
      const button = page.getByRole("button", { name: triggerLabel });
      await expect
        .element(page.getByRole("tooltip", { includeHidden: true }))
        .not.toBeVisible();
      (button.element() as HTMLElement).focus();
      await expect.element(page.getByRole("tooltip")).toBeVisible();
      (button.element() as HTMLElement).blur();
      await expect
        .element(page.getByRole("tooltip", { includeHidden: true }))
        .not.toBeVisible();
    });

    it("if mouse moves from trigger to tooltip", async () => {
      const page = await render(Component, {
        ...baseProps,
        activateDelay: 0,
        deactivateDelay: 0,
      });
      const button = page.getByRole("button", { name: triggerLabel });
      const tooltip = page.getByRole("tooltip", { includeHidden: true });
      await expect.element(tooltip).not.toBeVisible();
      await button.hover();
      await expect.element(page.getByRole("tooltip")).toBeVisible();
      await tooltip.hover();
      await expect.element(page.getByRole("tooltip")).toBeVisible();
      await tooltip.unhover();
      await expect.element(tooltip).not.toBeVisible();
    });

    it("after delay", async () => {
      vi.useFakeTimers();
      const page = await render(Component, {
        ...baseProps,
        activateDelay: 350,
        deactivateDelay: 0,
      });
      const button = page.getByRole("button", { name: triggerLabel });
      await expect
        .element(page.getByRole("tooltip", { includeHidden: true }))
        .not.toBeVisible();
      await button.hover();
      vi.advanceTimersByTime(100);
      await expect
        .element(page.getByRole("tooltip", { includeHidden: true }))
        .not.toBeVisible();
      vi.advanceTimersByTime(250);
      await expect.element(page.getByRole("tooltip")).toBeVisible();
      vi.useRealTimers();
    });

    it("immediately while another tooltip is visible or during the chaining window", async () => {
      vi.useFakeTimers();
      const first = await render(Component, {
        ...baseProps,
        activateDelay: 350,
        deactivateDelay: 0,
      });
      const second = await render(Component, {
        ...baseProps,
        activateDelay: 350,
        deactivateDelay: 0,
      });
      const firstButton = first
        .getByRole("button", { name: triggerLabel })
        .nth(0);
      const secondButton = second
        .getByRole("button", { name: triggerLabel })
        .nth(1);
      const firstTooltip = first
        .getByRole("tooltip", { includeHidden: true })
        .nth(0);
      const secondTooltip = second
        .getByRole("tooltip", { includeHidden: true })
        .nth(1);

      (firstButton.element() as HTMLElement).focus();
      await expect.element(firstTooltip).not.toBeVisible();
      vi.advanceTimersByTime(350);
      await expect.element(firstTooltip).toBeVisible();
      vi.advanceTimersByTime(1000);

      await secondButton.hover();
      await expect.element(secondTooltip).toBeVisible();
      await expect.element(firstTooltip).toBeVisible();

      await secondButton.unhover();
      await expect.element(secondTooltip).not.toBeVisible();
      vi.advanceTimersByTime(1000);
      await secondButton.hover();
      await expect.element(secondTooltip).toBeVisible();

      await secondButton.unhover();
      await expect.element(secondTooltip).not.toBeVisible();
      (firstButton.element() as HTMLElement).blur();
      await expect.element(firstTooltip).not.toBeVisible();
      vi.advanceTimersByTime(100);
      await secondButton.hover();
      await expect.element(secondTooltip).toBeVisible();
      await secondButton.unhover();
      await expect.element(secondTooltip).not.toBeVisible();
      vi.advanceTimersByTime(350);
      await secondButton.hover();
      await expect.element(secondTooltip).not.toBeVisible();
      vi.advanceTimersByTime(350);
      await expect.element(secondTooltip).toBeVisible();
      vi.useRealTimers();
    });
  });

  describe("is hidden", () => {
    it("after delay", async () => {
      vi.useFakeTimers();
      const page = await render(Component, {
        ...baseProps,
        activateDelay: 0,
        deactivateDelay: 350,
      });
      const button = page.getByRole("button", { name: triggerLabel });
      const tooltip = page.getByRole("tooltip", { includeHidden: true });
      await button.hover();
      vi.advanceTimersByTime(0);
      await expect.element(tooltip).toBeVisible();
      await button.unhover();
      vi.advanceTimersByTime(349);
      await expect.element(tooltip).toBeVisible();
      vi.advanceTimersByTime(1);
      await expect.element(tooltip).not.toBeVisible();
      vi.useRealTimers();
    });
  });

  describe("closeOnEscape", () => {
    it("closes on Escape by default", async () => {
      const page = await render(Component, {
        ...baseProps,
        activateDelay: 0,
        deactivateDelay: 0,
      });
      const button = page.getByRole("button", { name: triggerLabel });
      const tooltip = page.getByRole("tooltip", { includeHidden: true });
      (button.element() as HTMLElement).focus();
      await expect.element(tooltip).toBeVisible();
      await userEvent.keyboard("{Escape}");
      await expect.element(tooltip).not.toBeVisible();
    });

    it("stays open on Escape when disabled", async () => {
      vi.useFakeTimers();
      const page = await render(Component, {
        ...baseProps,
        activateDelay: 0,
        deactivateDelay: 0,
        closeOnEscape: false,
      });
      const button = page.getByRole("button", { name: triggerLabel });
      const tooltip = page.getByRole("tooltip", { includeHidden: true });
      (button.element() as HTMLElement).focus();
      await vi.advanceTimersByTimeAsync(0);
      expect(tooltip.element()).toBeVisible();
      await userEvent.keyboard("{Escape}");
      await vi.advanceTimersByTimeAsync(0);
      expect(tooltip.element()).toBeVisible();
    });
  });

  describe("Renders", () => {
    it("trigger", async () => {
      const page = await render(Component, { ...baseProps });
      const button = page.getByRole("button", { name: triggerLabel });
      await expect.element(button).toBeInTheDocument();
    });

    it("tooltip", async () => {
      const page = await render(Component, { ...baseProps });
      const tooltip = componentLocator(page, true);
      await expect.element(tooltip).toBeInTheDocument();
      await expect.element(tooltip).toHaveTextContent(childrenLabel);
    });

    it("icon", async () => {
      const page = await render(Component, { ...baseProps, icon });
      const tooltip = componentLocator(page, true);
      await expect.element(tooltip.getByText(iconLabel)).toBeInTheDocument();
    });

    it("not visible by default", async () => {
      const page = await render(Component, { ...baseProps });
      const tooltip = componentLocator(page, true);
      await expect.element(tooltip).not.toBeVisible();
    });
  });

  describe("preferredDirections", () => {
    // The trigger renders at the top of the page, so `top` never fits.
    it.each([
      [["top", "bottom"], "bottom"],
      [["top", "right-start", "bottom"], "right-start"],
    ] as const)(
      "tries %j in order and uses the first that fits",
      async (preferredDirections, expectedPlacement) => {
        const page = await render(Component, {
          ...baseProps,
          activateDelay: 0,
          preferredDirections: [...preferredDirections],
        });
        (
          page
            .getByRole("button", { name: triggerLabel })
            .element() as HTMLElement
        ).focus();
        await expect
          .element(componentLocator(page))
          .toHaveAttribute("data-placement", expectedPlacement);
      },
    );

    it("uses the only preferred direction when autoFit is false", async () => {
      const page = await render(Component, {
        ...baseProps,
        activateDelay: 0,
        autoFit: false,
        preferredDirections: ["top"],
      });
      (
        page
          .getByRole("button", { name: triggerLabel })
          .element() as HTMLElement
      ).focus();
      await expect
        .element(componentLocator(page))
        .toHaveAttribute("data-placement", "top");
    });

    it("falls back to the auto-fit placements when no preferred direction fits", async () => {
      const page = await render(Component, {
        ...baseProps,
        activateDelay: 0,
        autoFit: true,
        preferredDirections: ["top", "top-start"],
      });
      (
        page
          .getByRole("button", { name: triggerLabel })
          .element() as HTMLElement
      ).focus();
      await expect
        .element(componentLocator(page))
        .toHaveAttribute("data-placement", "right");
    });
  });
});

function componentLocator(
  page: RenderResult<typeof Component>,
  includeHidden?: boolean,
): Locator {
  return page.getByRole("tooltip", { includeHidden });
}
