import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import TanStackForm from "../TanStackForm.fixtures.svelte";

type TanStack = {
  state: { values: Record<string, unknown> };
  setFieldValue: (name: string, value: unknown) => void;
  reset: () => void;
};

/** Renders the fixture and returns the TanStack form it created. */
async function renderTanStackForm() {
  let form: TanStack | undefined;
  const page = await render(TanStackForm, {
    expose: (created: unknown) => {
      form = created as TanStack;
    },
  });
  if (!form) throw new Error("The fixture did not expose its form");
  return { page, form };
}

describe("TanStack Form as a form owner", () => {
  it("is not reactive under runes on its own; createBinding makes it so", async () => {
    const { page, form } = await renderTanStackForm();
    form.setFieldValue("email", "grace@example.com");
    await expect
      .element(page.getByTestId("owned"))
      .toHaveTextContent("grace@example.com");
    expect(page.getByTestId("direct").element().textContent).toBe(
      "ada@example.com",
    );
    await expect
      .element(page.getByLabelText("Email"))
      .toHaveValue("grace@example.com");
  });

  it("binds fields by name, shows TanStack's errors as it reports them, and resets", async () => {
    const { page, form } = await renderTanStackForm();
    const input = page.getByLabelText("Email");
    const toggleNewsletter = () =>
      (page.getByLabelText("Newsletter").element() as HTMLElement).click();
    expect(page.container.textContent).not.toContain(
      "Enter a valid email address",
    );
    await userEvent.clear(input);
    await userEvent.type(input, "grace");
    await expect.poll(() => form.state.values.email).toBe("grace");
    await expect
      .element(page.getByText("Enter a valid email address"))
      .toBeVisible();
    toggleNewsletter();
    await expect.poll(() => form.state.values.newsletter).toBe(true);
    await page.getByLabelText("Topic").fill("Releases");
    await expect.poll(() => form.state.values.topic).toBe("Releases");
    toggleNewsletter();
    await expect.element(page.getByLabelText("Topic")).not.toBeInTheDocument();
    expect(form.state.values.topic).toBeUndefined();
    form.reset();
    await expect.element(input).toHaveValue("ada@example.com");
  });
});
