import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { Chip } from "./index.js";
import Fixture from "./test.fixtures.svelte";

describe("Chip", () => {
  it("uses a non-submitting button for its action", async () => {
    const onclick = vi.fn();
    const page = await render(Chip, { value: "Ubuntu", onclick });
    const button = page.getByRole("button", { name: "Ubuntu" });

    expect((button.element() as HTMLButtonElement).type).toBe("button");
    await button.click();
    expect(onclick).toHaveBeenCalledOnce();
  });

  it.each(["submit", "reset"] as const)(
    "accepts the native %s button type",
    async (type) => {
      const page = await render(Chip, {
        value: "Ubuntu",
        onclick: vi.fn(),
        type,
      });

      await expect
        .element(page.getByRole("button", { name: "Ubuntu" }))
        .toHaveAttribute("type", type);
    },
  );

  it.each([false, true])(
    "only shows interactive affordances when enabled (disabled: %s)",
    async (disabled) => {
      const onclick = vi.fn();
      const page = await render(Chip, {
        value: "Ubuntu",
        onclick,
        disabled,
        style:
          "--chip-color-background: rgb(0, 0, 0); " +
          "--hover--color-foreground-secondary: rgb(255, 255, 255); " +
          "--motion-duration-fast: 0s;",
      });
      const button = page.getByRole("button", { name: "Ubuntu" });

      expect(getComputedStyle(button.element()).cursor === "pointer").toBe(
        !disabled,
      );
      await button.hover();
      await expect.element(button).toHaveStyle({
        backgroundColor: disabled ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)",
      });
      (button.element() as HTMLButtonElement).click();
      expect(onclick).toHaveBeenCalledTimes(disabled ? 0 : 1);
    },
  );

  it("exposes only dismissal as an action, with a contextual name", async () => {
    const onclick = vi.fn();
    const page = await render(Fixture, {
      dismissProps: { onclick },
    });
    const root = page.container.querySelector(".ds.chip");
    const dismiss = page.getByRole("button", { name: "Dismiss Owner: Bob" });

    expect(root?.tagName).toBe("SPAN");
    expect(root?.textContent?.replace(/\s+/g, " ").trim()).toBe("Owner: Bob");
    await expect.element(dismiss).toHaveAccessibleName("Dismiss Owner: Bob");
    await dismiss.click();
    expect(onclick).toHaveBeenCalledOnce();
  });

  describe("context", () => {
    it("updates the contextual name when chip content changes", async () => {
      const page = await render(Fixture, {
        dismissProps: { onclick: vi.fn() },
      });

      await page.rerender({ lead: "Reviewer", value: "Alice" });

      await expect
        .element(page.getByRole("button", { name: "Dismiss Reviewer: Alice" }))
        .toHaveAccessibleName("Dismiss Reviewer: Alice");
    });

    it("unregisters dismissal when removed and permits it to be mounted again", async () => {
      const page = await render(Fixture, {
        dismissProps: { onclick: vi.fn() },
      });

      for (let index = 0; index < 2; index += 1) {
        await page.rerender({ showDismiss: false });
        expect(page.container.querySelector("button")).toBeNull();
        expect(page.container.querySelector(".ds.chip")?.tagName).toBe("SPAN");

        await page.rerender({ showDismiss: true });
        await expect
          .element(page.getByRole("button", { name: "Dismiss Owner: Bob" }))
          .toBeInTheDocument();
        expect(page.container.querySelector(".ds.chip")?.tagName).toBe("SPAN");
      }
    });

    it("keeps context local when another chip's dismissal mounts or unmounts", async () => {
      const page = await render(Fixture, {
        dismissProps: { onclick: vi.fn() },
        secondChip: true,
      });

      await expect
        .element(page.getByRole("button", { name: "Dismiss Owner: Bob" }))
        .toBeInTheDocument();
      await expect
        .element(page.getByRole("button", { name: "Dismiss Reviewer: Alice" }))
        .toBeInTheDocument();

      await page.rerender({
        lead: "Category",
        value: "Ubuntu",
        showDismiss: false,
      });
      expect(page.container.querySelectorAll("button")).toHaveLength(1);
      await expect
        .element(page.getByRole("button", { name: "Dismiss Reviewer: Alice" }))
        .toHaveAccessibleName("Dismiss Reviewer: Alice");

      await page.rerender({ showDismiss: true });
      await expect
        .element(page.getByRole("button", { name: "Dismiss Category: Ubuntu" }))
        .toHaveAccessibleName("Dismiss Category: Ubuntu");
      await expect
        .element(page.getByRole("button", { name: "Dismiss Reviewer: Alice" }))
        .toHaveAccessibleName("Dismiss Reviewer: Alice");
    });

    it("preserves an explicit dismiss label when context values change", async () => {
      const page = await render(Fixture, {
        dismissProps: {
          onclick: vi.fn(),
          "aria-label": "Remove owner",
        },
      });

      await page.rerender({ lead: "Reviewer", value: "Alice" });

      await expect
        .element(page.getByRole("button", { name: "Remove owner" }))
        .toHaveAccessibleName("Remove owner");
    });
  });
});
