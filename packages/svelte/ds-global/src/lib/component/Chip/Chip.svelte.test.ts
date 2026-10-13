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
