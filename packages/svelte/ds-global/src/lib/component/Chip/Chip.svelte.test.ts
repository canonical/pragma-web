import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import Chip from "./Chip.svelte";

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
    "ignores the native %s button type",
    async (type) => {
      const page = await render(Chip, {
        value: "Ubuntu",
        onclick: vi.fn(),
        type,
      });

      await expect
        .element(page.getByRole("button", { name: "Ubuntu" }))
        .toHaveAttribute("type", "button");
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
    const ondismiss = vi.fn();
    const page = await render(Chip, {
      lead: "Owner",
      value: "Bob",
      ondismiss,
    });
    const root = page.container.querySelector(".ds.chip");
    const dismiss = page.getByRole("button", { name: "Dismiss Owner: Bob" });

    expect(root?.tagName).toBe("SPAN");
    expect(root?.textContent?.replace(/\s+/g, " ").trim()).toBe("Owner: Bob");
    await expect.element(dismiss).toHaveAccessibleName("Dismiss Owner: Bob");
    await dismiss.click();
    expect(ondismiss).toHaveBeenCalledOnce();
  });
});
