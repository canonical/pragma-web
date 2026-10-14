import type { ComponentProps } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import Fixture, { customIcon } from "../../test.fixtures.svelte";

describe("Chip.Dismiss", () => {
  const baseProps = {
    dismissProps: { onclick: () => {} },
  } satisfies ComponentProps<typeof Fixture>;

  it("renders as a button inside the chip span", async () => {
    const page = await render(Fixture, baseProps);
    const dismiss = page.getByRole("button", { name: "Dismiss Owner: Bob" });

    await expect.element(dismiss).toBeInTheDocument();
    expect(dismiss.element().closest(".ds.chip")?.tagName).toBe("SPAN");
  });

  it("forwards native dismiss attributes and events without applying them to the root", async () => {
    const onclick = vi.fn((event) => {
      expect(event.currentTarget.tagName).toBe("BUTTON");
    });
    const onfocus = vi.fn();
    const onkeydown = vi.fn();
    const page = await render(Fixture, {
      dismissProps: {
        onclick,
        onfocus,
        onkeydown,
        class: "custom-dismiss",
        id: "dismiss-owner",
        title: "Remove owner",
        "aria-label": "Remove Bob",
        "data-testid": "dismiss-control",
      },
    });
    const root = page.container.querySelector(".ds.chip");
    const dismiss = page.getByRole("button", { name: "Remove Bob" });

    expect(root?.tagName).toBe("SPAN");
    expect(root?.id).toBe("chip-root");
    expect(root?.classList.contains("custom-chip")).toBe(true);
    expect(root?.hasAttribute("title")).toBe(false);
    await expect.element(dismiss).toHaveClass("dismiss", "custom-dismiss");
    await expect.element(dismiss).toHaveAttribute("id", "dismiss-owner");
    await expect.element(dismiss).toHaveAttribute("title", "Remove owner");
    await expect
      .element(dismiss)
      .toHaveAttribute("data-testid", "dismiss-control");

    (dismiss.element() as HTMLButtonElement).focus();
    expect(onfocus).toHaveBeenCalledOnce();
    await dismiss.click();
    expect(onclick).toHaveBeenCalledOnce();
    dismiss
      .element()
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    expect(onkeydown).toHaveBeenCalledOnce();
  });

  it("disables only the dismiss control", async () => {
    const onclick = vi.fn();
    const page = await render(Fixture, {
      dismissProps: { onclick, disabled: true },
    });
    const dismiss = page.getByRole("button", { name: "Dismiss Owner: Bob" });

    await expect.element(dismiss).toBeDisabled();
    expect(
      page.container.querySelector(".ds.chip")?.hasAttribute("disabled"),
    ).toBe(false);
    (dismiss.element() as HTMLButtonElement).click();
    expect(onclick).not.toHaveBeenCalled();
  });

  it.each(["submit", "reset"] as const)(
    "accepts the native %s dismiss button type",
    async (type) => {
      const page = await render(Fixture, {
        dismissProps: { onclick: vi.fn(), type },
      });

      await expect
        .element(page.getByRole("button", { name: "Dismiss Owner: Bob" }))
        .toHaveAttribute("type", type);
    },
  );

  it("allows custom dismiss content", async () => {
    const page = await render(Fixture, {
      dismissProps: { onclick: vi.fn(), children: customIcon },
    });

    await expect.element(page.getByTestId("custom-icon")).toBeInTheDocument();
    expect(page.container.querySelector(".dismiss svg")).toBeNull();
    await expect
      .element(page.getByRole("button", { name: "Dismiss Owner: Bob" }))
      .toHaveAccessibleName("Dismiss Owner: Bob");
  });

  describe("styles", () => {
    it("keeps the control fixed-size and centers its icon", async () => {
      const page = await render(Fixture, {
        dismissProps: {
          ...baseProps.dismissProps,
          style:
            "--dimension-200: 16px; " +
            "--dimension-025: 2px; " +
            "--dimension-stroke-thickness-medium: 1px; " +
            "--dimension-radius-full: 999px;",
        },
      });
      const dismiss = page.getByRole("button");
      const button = dismiss.element() as HTMLButtonElement;

      // Flex items compute to flex even when their declared display is inline-flex.
      await expect.element(dismiss).toHaveStyle({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
        inlineSize: "16px",
        blockSize: "16px",
        margin: "0px",
        padding: "2px",
        borderRadius: "999px",
      });
      const icon = button.querySelector("svg");
      expect(icon?.getBoundingClientRect().width).toBe(button.clientWidth - 4);
      expect(icon?.getBoundingClientRect().height).toBe(
        button.clientHeight - 4,
      );
    });

    it.each([false, true])(
      "only shows interactive affordances when enabled (disabled: %s)",
      async (disabled) => {
        const page = await render(Fixture, {
          dismissProps: {
            ...baseProps.dismissProps,
            disabled,
            style: "--hover--color-foreground-secondary: rgb(255, 0, 0);",
          },
        });
        const dismiss = page.getByRole("button");

        expect(getComputedStyle(dismiss.element()).cursor === "pointer").toBe(
          !disabled,
        );
        await dismiss.hover();
        await expect.element(dismiss).toHaveStyle({
          backgroundColor: disabled ? "rgba(0, 0, 0, 0)" : "rgb(255, 0, 0)",
        });
      },
    );
  });

  describe("attributes", () => {
    it.each([
      ["id", "dismiss-bob"],
      ["aria-label", "Remove Bob"],
      ["aria-describedby", "dismiss-help"],
      ["name", "remove-owner"],
      ["value", "Bob"],
      ["tabindex", "-1"],
    ])("applies %s to the dismiss button", async (attribute, expected) => {
      const page = await render(Fixture, {
        dismissProps: {
          ...baseProps.dismissProps,
          [attribute]: expected,
        },
      });
      const dismiss = page.getByRole("button");

      await expect.element(dismiss).toHaveAttribute(attribute, expected);
      expect(
        page.container.querySelector(".ds.chip")?.getAttribute(attribute),
      ).not.toBe(expected);
    });

    it("merges custom classes with the dismiss class", async () => {
      const page = await render(Fixture, {
        dismissProps: { ...baseProps.dismissProps, class: "custom-dismiss" },
      });

      await expect
        .element(page.getByRole("button"))
        .toHaveClass("dismiss", "custom-dismiss");
    });

    it("applies native inline styles", async () => {
      const page = await render(Fixture, {
        dismissProps: { ...baseProps.dismissProps, style: "color: orange;" },
      });

      await expect
        .element(page.getByRole("button"))
        .toHaveStyle({ color: "orange" });
    });
  });
});
