import { flushSync, hydrate, unmount } from "svelte";
import { describe, expect, it, onTestFinished } from "vitest";
import HydrationAdoption from "../HydrationAdoption.fixtures.svelte";
import HydrationPhone from "../HydrationPhone.fixtures.svelte";
import serveFixture from "../serveFixture.js";

/** Types into a control as a user would before the page hydrates. */
function edit(control: Element | null, value: string) {
  const element = control as HTMLInputElement;
  element.value = value;
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

function check(control: Element | null, checked: boolean) {
  (control as HTMLInputElement).checked = checked;
}

describe("Edits made before hydration", () => {
  it("are kept by every bound control", async () => {
    const container = await serveFixture("HydrationAdoption");
    const byName = (name: string) =>
      container.querySelector(`[name="${name}"]`);
    edit(byName("text"), "typed");
    edit(byName("textarea"), "typed");
    edit(byName("number"), "7");
    edit(byName("date"), "2026-02-03");
    check(byName("checkbox"), true);
    check(byName("switch"), false);
    (byName("select") as HTMLSelectElement).value = "b";
    for (const option of (byName("multiple") as HTMLSelectElement).options)
      option.selected = option.value === "b";
    check(container.querySelector('[name="radio"][value="b"]'), true);
    check(container.querySelector('[name="checks"][value="b"]'), true);
    check(container.querySelector('[name="rich"][value="b"]'), true);
    check(container.querySelector('[name="richMany"][value="a"]'), true);
    (container.querySelector(".country-select") as HTMLSelectElement).value =
      "GB";
    edit(byName("phone"), "7700900123");
    check(container.querySelector('[name="rating"][value="4"]'), true);

    const app = hydrate(HydrationAdoption, { target: container });
    flushSync();
    onTestFinished(() => {
      unmount(app);
      container.remove();
    });

    expect(
      JSON.parse(container.querySelector("output")?.textContent ?? "{}"),
    ).toEqual({
      text: "typed",
      textarea: "typed",
      number: 7,
      date: "2026-02-03",
      checkbox: true,
      switch: false,
      select: "b",
      multiple: ["b"],
      radio: "b",
      checks: ["a", "b"],
      rich: "b",
      richMany: ["a"],
      phone: "+447700900123",
      rating: 4,
    });
    expect((byName("select") as HTMLSelectElement).value).toBe("b");
    expect(
      (container.querySelector(".country-select") as HTMLSelectElement).value,
    ).toBe("GB");
  });

  it("leave untouched controls to their bound values", async () => {
    const container = await serveFixture("HydrationAdoption");
    const app = hydrate(HydrationAdoption, { target: container });
    flushSync();
    expect(
      JSON.parse(container.querySelector("output")?.textContent ?? "{}"),
    ).toMatchObject({ text: "server", select: "a", phone: "+15551234" });
    unmount(app);
    container.remove();
  });

  it("keep a phone country or number changed on its own", async () => {
    const container = await serveFixture("HydrationPhone");
    (
      container.querySelector('[name="country-country"]') as HTMLSelectElement
    ).value = "GB";
    edit(container.querySelector("#number"), "555 0000");
    const app = hydrate(HydrationPhone, { target: container });
    flushSync();
    onTestFinished(() => {
      unmount(app);
      container.remove();
    });
    expect(
      JSON.parse(container.querySelector("output")?.textContent ?? "{}"),
    ).toEqual({
      country: "+445551234",
      number: "+15550000",
    });
  });
});
