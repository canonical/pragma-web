import { flushSync, hydrate, unmount } from "svelte";
import { describe, expect, it, onTestFinished } from "vitest";
import { userEvent } from "vitest/browser";
import HydrationCombobox from "../../../../testing/HydrationCombobox.fixtures.svelte";
import serveFixture from "../../../../testing/serveFixture.js";

describe("ComboboxInput hydration", () => {
  it("adopts the server markup with the same downshift IDs", async () => {
    const container = await serveFixture("HydrationCombobox");
    const input = container.querySelector(
      '[role="combobox"]',
    ) as HTMLInputElement;
    const ids = [
      input.id,
      input.getAttribute("aria-controls"),
      ...[...container.querySelectorAll("li")].map((item) => item.id),
    ];
    expect(input.value).toBe("Banana");
    expect(ids[0]).toMatch(/^downshift-.+-input$/);

    const app = hydrate(HydrationCombobox, { target: container });
    flushSync();
    onTestFinished(() => {
      unmount(app);
      container.remove();
    });

    // The server's elements are kept, with the same IDs and wiring.
    expect(container.querySelector('[role="combobox"]')).toBe(input);
    expect([
      input.id,
      input.getAttribute("aria-controls"),
      ...[...container.querySelectorAll("li")].map((item) => item.id),
    ]).toEqual(ids);
    expect(input.value).toBe("Banana");
    expect(
      (container.querySelector('input[type="hidden"]') as HTMLInputElement)
        .value,
    ).toBe("banana");

    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    const active = input.getAttribute("aria-activedescendant") as string;
    expect(container.querySelector(`#${CSS.escape(active)}`)?.textContent).toBe(
      "Banana",
    );
    await userEvent.keyboard("{ArrowUp}{Enter}");
    await expect
      .poll(() => container.querySelector("output")?.textContent)
      .toBe('"apple"');
  });
});
