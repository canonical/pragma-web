import { flushSync } from "svelte";
import { createAttachmentKey } from "svelte/attachments";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import BindFieldForm from "../../../testing/BindFieldForm.fixtures.svelte";
import CustomScore from "../../../testing/CustomScore.svelte";
import FormStateForm from "../../../testing/FormStateForm.fixtures.svelte";
import OwnedForm from "../../../testing/OwnedForm.fixtures.svelte";
import readBound from "../../../testing/readBound.js";
import createFormState from "../../utils/owner/createFormState.svelte.js";
import type { FormOwner } from "../../utils/owner/types.js";
import { Form } from "./index.js";

const email = { name: "email", inputType: "email", label: "Email" } as const;

describe("Form", () => {
  it("passes native attributes and attachments through without an owner", async () => {
    const attach = vi.fn();
    const page = await render(Form, {
      method: "post",
      action: "/save",
      class: "form-layout-side",
      [createAttachmentKey()]: attach,
    });
    const form = page.container.querySelector("form");
    expect(form?.className).toBe("ds form subgrid form-layout-side");
    expect(form?.getAttribute("method")).toBe("post");
    expect(form?.getAttribute("action")).toBe("/save");
    expect(attach).toHaveBeenCalledWith(form);
  });

  it("lets the owner stop a submit before later listeners, such as enhance", async () => {
    let isValid = false;
    const owner: FormOwner = {
      values: {},
      setValue: vi.fn(),
      submit: (event) => {
        if (!isValid) event.preventDefault();
      },
    };
    const later = vi.fn((event: Event) => event.preventDefault());
    const onsubmitcapture = vi.fn();
    const onsubmit = vi.fn();
    const page = await render(Form, {
      owner,
      onsubmit,
      onsubmitcapture,
      [createAttachmentKey()]: (form: HTMLFormElement) =>
        form.addEventListener("submit", later),
    });
    const form = page.container.querySelector("form") as HTMLFormElement;
    form.requestSubmit();
    expect(onsubmitcapture).toHaveBeenCalledOnce();
    expect(onsubmit).toHaveBeenCalledOnce();
    expect(later).not.toHaveBeenCalled();
    isValid = true;
    form.requestSubmit();
    expect(onsubmit).toHaveBeenCalledTimes(2);
    expect(later).toHaveBeenCalledOnce();
  });

  it("leaves a submit stopped by onsubmit to later listeners without an owner", async () => {
    const later = vi.fn((event: Event) => event.defaultPrevented);
    const page = await render(Form, {
      onsubmit: (event: SubmitEvent) => event.preventDefault(),
      [createAttachmentKey()]: (form: HTMLFormElement) =>
        form.addEventListener("submit", later),
    });
    (page.container.querySelector("form") as HTMLFormElement).requestSubmit();
    expect(later).toHaveLastReturnedWith(true);
  });

  it("leaves fields to hold their own value without an owner", async () => {
    const page = await render(OwnedForm, { fields: [email] });
    await userEvent.type(page.getByRole("textbox"), "a@b.c");
    await expect.element(page.getByRole("textbox")).toHaveValue("a@b.c");
  });

  it("hides a field whose condition turns false without an owner", async () => {
    let shown = $state(true);
    const page = await render(OwnedForm, {
      fields: [{ ...email, condition: () => shown }],
    });
    await expect.element(page.getByRole("textbox")).toBeVisible();
    shown = false;
    await expect.element(page.getByRole("textbox")).not.toBeInTheDocument();
  });

  it("binds a field to an owner outside a form with bindField", async () => {
    const owner = createFormState({
      defaultValues: { email: "" },
      validate: (values) => ({
        email: values.email ? undefined : "Email is required",
      }),
      mode: "onTouched",
    });
    const page = await render(BindFieldForm, { owner });
    const input = page.getByRole("textbox");
    expect(page.container.textContent).not.toContain("Email is required");
    await input.click();
    await userEvent.tab();
    await expect.element(page.getByText("Email is required")).toBeVisible();
    // `fill` writes the value in one step; typed keys could land before the
    // input has focus again.
    await input.fill("a@b.c");
    await expect.poll(() => owner.values.email).toBe("a@b.c");
    await expect
      .element(page.getByText("Email is required"))
      .not.toBeInTheDocument();
  });

  it("binds a field's value to the owner by name", async () => {
    const owner = createFormState({
      defaultValues: { email: "ada@example.com" },
    });
    const page = await render(OwnedForm, { owner, fields: [email] });
    const input = page.getByRole("textbox");
    await expect.element(input).toHaveValue("ada@example.com");
    await userEvent.clear(input);
    await userEvent.type(input, "grace@example.com");
    await expect.poll(() => owner.values.email).toBe("grace@example.com");
    owner.setValue("email", "linus@example.com");
    await expect.element(input).toHaveValue("linus@example.com");
  });

  it("binds each input type's value to the owner", async () => {
    const owner = createFormState<Record<string, unknown>>({
      defaultValues: { size: 3 },
    });
    const page = await render(OwnedForm, {
      owner,
      fields: [
        { name: "terms", inputType: "checkbox", label: "Terms" },
        { name: "size", inputType: "number", label: "Size" },
        {
          name: "plan",
          inputType: "select",
          label: "Plan",
          options: [
            { value: "free", label: "Free" },
            { value: "pro", label: "Pro" },
          ],
        },
      ],
    });
    (page.getByRole("checkbox").element() as HTMLElement).click();
    await expect.poll(() => owner.values.terms).toBe(true);
    await expect.element(page.getByRole("spinbutton")).toHaveValue(3);
    await page.getByRole("combobox").selectOptions("pro");
    await expect.poll(() => owner.values.plan).toBe("pro");
  });

  it("shows any owner error at once, and tells the owner on blur", async () => {
    const owner = createFormState({
      defaultValues: { email: "" },
      validate: (values) => ({
        email: values.email ? undefined : "Email is required",
      }),
      mode: "onChange",
    });
    const onblur = vi.fn();
    const page = await render(OwnedForm, {
      owner,
      fields: [{ ...email, onblur }],
    });
    expect(page.container.textContent).not.toContain("Email is required");
    await userEvent.type(page.getByRole("textbox"), "a");
    await userEvent.clear(page.getByRole("textbox"));
    await expect.element(page.getByText("Email is required")).toBeVisible();
    expect(owner.touched.email).toBeUndefined();
    await userEvent.tab();
    await expect.poll(() => owner.touched.email).toBe(true);
    expect(onblur).toHaveBeenCalledOnce();
  });

  it("passes the owner's error and blur to a custom component", async () => {
    const owner: FormOwner = {
      values: { score: 1 },
      setValue: vi.fn(),
      getError: () => "Too low",
      blur: vi.fn(),
    };
    const page = await render(OwnedForm, {
      owner,
      fields: [
        {
          name: "score",
          inputType: "custom",
          label: "Score",
          component: CustomScore,
          step: 1,
        } as never,
      ],
    });
    await expect.element(page.getByText("Too low")).toBeVisible();
  });

  it("lets an explicit error and bound value win over the owner", async () => {
    const owner = createFormState({
      defaultValues: { email: "owner@example.com" },
      validate: () => ({ email: "Owner error" }),
      mode: "onBlur",
    });
    owner.blur("email");
    const page = await render(OwnedForm, {
      owner,
      fields: [],
      bound: { ...email, error: "Server error" },
      value: "mine@example.com",
    });
    await expect
      .element(page.getByRole("textbox"))
      .toHaveValue("mine@example.com");
    await expect.element(page.getByText("Server error")).toBeVisible();
    expect(page.container.textContent).not.toContain("Owner error");
    await userEvent.type(page.getByRole("textbox"), "!");
    await expect
      .poll(() => readBound(page.container))
      .toBe("mine@example.com!");
    expect(owner.values.email).toBe("owner@example.com");
  });

  it("works with an owner that has values only", async () => {
    const values = $state<Record<string, unknown>>({ email: "" });
    const owner: FormOwner = {
      values,
      setValue: (name, value) => {
        values[name] = value;
      },
    };
    const page = await render(OwnedForm, { owner, fields: [email] });
    await userEvent.type(page.getByRole("textbox"), "x");
    await userEvent.tab();
    await expect.poll(() => values.email).toBe("x");
    expect(page.container.querySelector(".danger")).toBeNull();
  });

  it("passes the owner's values to a condition, and drops a value when its field hides", async () => {
    const owner = createFormState<Record<string, unknown>>({
      defaultValues: { role: "company", company_name: "Canonical", vat: "GB1" },
    });
    const isCompany = (values: Readonly<Record<string, unknown>>) =>
      values.role === "company";
    const page = await render(OwnedForm, {
      owner,
      fields: [
        { name: "role", inputType: "text", label: "Role" },
        {
          name: "company_name",
          inputType: "text",
          label: "Company name",
          condition: isCompany,
        },
        { name: "vat", inputType: "hidden", condition: isCompany },
        {
          name: "terms",
          inputType: "checkbox",
          label: "Terms",
          condition: isCompany,
        },
      ],
    });
    await expect
      .element(page.getByLabelText("Company name"))
      .toHaveValue("Canonical");
    owner.setValue("terms", true);
    owner.setValue("role", "individual");
    flushSync();
    await expect
      .element(page.getByLabelText("Company name"))
      .not.toBeInTheDocument();
    expect(owner.values).toEqual({ role: "individual" });
    owner.setValue("role", "company");
    await expect.element(page.getByLabelText("Company name")).toHaveValue("");
  });

  it("keeps the value of a field hidden from the start", async () => {
    const owner = createFormState({
      defaultValues: { role: "individual", company_name: "Kept" },
    });
    const page = await render(OwnedForm, {
      owner,
      fields: [
        {
          name: "company_name",
          inputType: "text",
          label: "Company name",
          condition: (values) => values.role === "company",
        },
      ],
    });
    expect(page.container.querySelector("input")).toBeNull();
    expect(owner.values.company_name).toBe("Kept");
  });

  it("lets the owner stop an invalid submit before onsubmit sees it", async () => {
    const onsubmit = vi.fn((event: SubmitEvent) => event.defaultPrevented);
    const onSubmit = vi.fn();
    const page = await render(FormStateForm, { onsubmit, onSubmit });
    const input = page.getByLabelText("Email");
    await page.getByRole("button").click();
    await expect.element(page.getByText("Email is required")).toBeVisible();
    await expect.element(input).toHaveFocus();
    expect(onsubmit).toHaveLastReturnedWith(true);
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(input, "ada@example.com");
    await expect
      .element(page.getByText("Email is required"))
      .not.toBeInTheDocument();
    await page.getByRole("button").click();
    await expect
      .poll(() => onSubmit.mock.calls)
      .toEqual([[{ email: "ada@example.com" }]]);
    expect(onsubmit).toHaveBeenCalledTimes(2);
  });
});
