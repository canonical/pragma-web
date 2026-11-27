import { createAttachmentKey } from "svelte/attachments";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import NativeValidity from "../../testing/NativeValidity.fixtures.svelte";

const username = {
  inputType: "text",
  name: "username",
  label: "Username",
} as const;

async function renderFields(props: Record<string, unknown>) {
  const page = await render(NativeValidity, props);
  const readError = () =>
    page.container.querySelector(".field-error")?.textContent ?? null;
  const form = () => page.container.querySelector("form") as HTMLFormElement;
  return { page, readError, form };
}

// The tests fire `invalid` with `checkValidity()`, as a failed submit does,
// but without the browser's interactive validation, which moves focus and
// would take it from tests running beside these.
describe("Field native validity", () => {
  it("shows the control's message from its first invalid event on", async () => {
    const { page, readError, form } = await renderFields({
      fields: [username],
    });
    const input = page.container.querySelector("input") as HTMLInputElement;
    await userEvent.fill(input, "a");
    await userEvent.fill(input, "");
    expect(readError()).toBeNull();
    form().checkValidity();
    await expect.poll(readError).toBe(input.validationMessage);
    expect(input.validationMessage).not.toBe("");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    await userEvent.fill(input, "ada");
    await expect.poll(readError).toBeNull();
    expect(input.getAttribute("aria-invalid")).toBe("false");
    await userEvent.fill(input, "");
    await expect.poll(readError).toBe(input.validationMessage);
  });

  it("shows an explicit error instead of the native message", async () => {
    const { readError, form } = await renderFields({
      fields: [{ ...username, error: "Taken on the server" }],
    });
    form().checkValidity();
    await expect.poll(readError).toBe("Taken on the server");
  });

  it("stops showing messages when the form is reset", async () => {
    const { page, readError, form } = await renderFields({
      fields: [username],
    });
    const input = page.container.querySelector("input") as HTMLInputElement;
    form().checkValidity();
    await expect.poll(readError).not.toBeNull();
    form().reset();
    await expect.poll(readError).toBeNull();
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(readError()).toBeNull();
  });

  it("stops when the field is hidden, and starts again on invalid", async () => {
    const { page, readError, form } = await renderFields({
      fields: [username],
    });
    form().checkValidity();
    await expect.poll(readError).not.toBeNull();
    await page.rerender({ fields: [{ ...username, condition: () => false }] });
    await expect.poll(readError).toBeNull();
    await page.rerender({ fields: [{ ...username, condition: () => true }] });
    const input = page.container.querySelector("input") as HTMLInputElement;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(readError()).toBeNull();
    input.checkValidity();
    await expect.poll(readError).toBe(input.validationMessage);
  });

  it("works outside a form", async () => {
    const { page, readError } = await renderFields({
      fields: [username],
      isInForm: false,
    });
    const input = page.container.querySelector("input") as HTMLInputElement;
    input.checkValidity();
    await expect.poll(readError).toBe(input.validationMessage);
  });

  it("shows the first message among a field's controls", async () => {
    const { page, readError, form } = await renderFields({
      fields: [
        {
          inputType: "phone",
          name: "phone",
          label: "Phone",
          [createAttachmentKey()]: (input: HTMLInputElement) =>
            input.setCustomValidity("Not a number"),
        },
      ],
    });
    // The country select comes first and is valid.
    expect(page.container.querySelector("select")?.validationMessage).toBe("");
    form().checkValidity();
    await expect.poll(readError).toBe("Not a number");
  });

  it("shows a toggle's custom validity", async () => {
    const { page, readError } = await renderFields({
      fields: [
        {
          inputType: "checkbox",
          name: "terms",
          controlLabel: "I agree",
          [createAttachmentKey()]: (input: HTMLInputElement) =>
            input.setCustomValidity("Agree to continue"),
        },
      ],
    });
    const input = page.container.querySelector("input") as HTMLInputElement;
    input.checkValidity();
    await expect.poll(readError).toBe("Agree to continue");
  });
});
