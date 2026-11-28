import { flushSync, hydrate, unmount } from "svelte";
import { describe, expect, it, onTestFinished } from "vitest";
import { userEvent } from "vitest/browser";
import HydrationCombobox from "../../../../testing/HydrationCombobox.fixtures.svelte";
import HydrationMultipleCombobox from "../../../../testing/HydrationMultipleCombobox.fixtures.svelte";
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

  it("adopts the server chips and hidden inputs of a multiple combobox", async () => {
    const container = await serveFixture("HydrationMultipleCombobox");
    const chips = [...container.querySelectorAll(".chip")];
    const readPosted = () =>
      [...container.querySelectorAll('input[type="hidden"]')].map(
        (input) => (input as HTMLInputElement).value,
      );
    expect(chips.map((chip) => chip.textContent)).toEqual([
      "Apple×",
      "Banana×",
    ]);
    expect(readPosted()).toEqual(["apple", "banana"]);

    const app = hydrate(HydrationMultipleCombobox, { target: container });
    flushSync();
    onTestFinished(() => {
      unmount(app);
      container.remove();
    });

    // The server's chips are kept, and the keyboard reaches them.
    expect([...container.querySelectorAll(".chip")]).toEqual(chips);
    const input = container.querySelector(
      '[role="combobox"]',
    ) as HTMLInputElement;
    input.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => document.activeElement).toBe(chips[1]);
    await userEvent.keyboard("{Backspace}");
    await expect
      .poll(() => container.querySelector("output")?.textContent)
      .toBe('["apple"]');
    expect(readPosted()).toEqual(["apple"]);
  });
});
