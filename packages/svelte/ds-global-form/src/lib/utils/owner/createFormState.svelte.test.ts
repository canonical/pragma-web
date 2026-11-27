import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";
import createFormState from "./createFormState.svelte.js";
import type { FormState, FormValues } from "./types.js";

type Values = { email?: string; age?: number };

const validate = (values: Readonly<Values>) => ({
  email: values.email ? undefined : "Email is required",
  age: (values.age ?? 0) < 18 ? "Must be at least 18" : undefined,
});

/**
 * Submits a detached form through the owner. Returns whether the browser
 * would have posted it; the post itself is always stopped.
 */
function submit<V extends FormValues>(state: FormState<V>): boolean {
  const form = document.createElement("form");
  document.body.append(form);
  let posted = false;
  form.addEventListener("submit", (event) => {
    state.submit(event);
    posted = !event.defaultPrevented;
    event.preventDefault();
  });
  form.requestSubmit();
  form.remove();
  return posted;
}

describe("createFormState", () => {
  it("holds values from its defaults, and drops a value written as undefined", () => {
    const defaultValues = { email: "ada@example.com", age: 36 };
    const state = createFormState<Values>({ defaultValues });
    state.setValue("email", "grace@example.com");
    state.setValue("age", undefined);
    expect(state.values).toEqual({ email: "grace@example.com" });
    expect(defaultValues).toEqual({ email: "ada@example.com", age: 36 });
  });

  it("starts empty without options, and is valid without a validate function", () => {
    const state = createFormState();
    expect(state.values).toEqual({});
    expect(submit(state)).toBe(true);
    expect(state.errors).toEqual({});
  });

  it("validates on submit only by default, then on every change", () => {
    const state = createFormState<Values>({ validate });
    state.setValue("email", "");
    state.blur("email");
    expect(state.errors).toEqual({});
    expect(state.touched).toEqual({ email: true });
    expect(submit(state)).toBe(false);
    expect(state.isSubmitted).toBe(true);
    expect(state.errors).toEqual({
      email: "Email is required",
      age: "Must be at least 18",
    });
    state.setValue("email", "ada@example.com");
    expect(state.getError("email")).toBeUndefined();
    expect(state.getError("age")).toBe("Must be at least 18");
  });

  it("validates the changed field only in onChange mode", () => {
    const state = createFormState<Values>({ validate, mode: "onChange" });
    state.setValue("email", "");
    expect(state.errors).toEqual({ email: "Email is required" });
  });

  it("validates a field when it is left in onBlur mode", () => {
    const state = createFormState<Values>({ validate, mode: "onBlur" });
    state.setValue("age", 3);
    expect(state.errors).toEqual({});
    state.blur("age");
    expect(state.errors).toEqual({ age: "Must be at least 18" });
    state.setValue("age", 20);
    expect(state.getError("age")).toBe("Must be at least 18");
  });

  it("validates a field once left, then on its every change, in onTouched mode", () => {
    const state = createFormState<Values>({ validate, mode: "onTouched" });
    state.setValue("age", 3);
    expect(state.errors).toEqual({});
    state.blur("age");
    expect(state.errors).toEqual({ age: "Must be at least 18" });
    state.setValue("age", 20);
    expect(state.errors).toEqual({});
  });

  it("calls onSubmit with the values instead of posting a valid form", async () => {
    let finish = () => {};
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const state = createFormState<Values>({
      defaultValues: { email: "ada@example.com", age: 36 },
      validate,
      onSubmit,
    });
    expect(submit(state)).toBe(false);
    expect(onSubmit).toHaveBeenCalledWith({
      email: "ada@example.com",
      age: 36,
    });
    expect(state.isSubmitting).toBe(true);
    finish();
    await expect.poll(() => state.isSubmitting).toBe(false);
  });

  it("is not submitting after a synchronous onSubmit", () => {
    const onSubmit = vi.fn();
    const state = createFormState({ onSubmit });
    expect(submit(state)).toBe(false);
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(state.isSubmitting).toBe(false);
  });

  it("lets a valid form post natively without onSubmit", () => {
    const state = createFormState<Values>({
      defaultValues: { email: "ada@example.com", age: 36 },
      validate,
    });
    expect(submit(state)).toBe(true);
  });

  it("focuses the first invalid control after a failed submit", async () => {
    const state = createFormState<Values>({ validate });
    const form = document.createElement("form");
    form.innerHTML =
      '<input id="valid" aria-invalid="false"><input id="invalid" aria-invalid="true">';
    document.body.append(form);
    form.addEventListener("submit", (event) => state.submit(event));
    form.requestSubmit();
    await expect.poll(() => document.activeElement?.id).toBe("invalid");
    form.remove();
  });

  it("returns to its defaults on reset, and is reactive throughout", () => {
    const state = createFormState<Values>({
      defaultValues: { email: "ada@example.com" },
      validate,
    });
    const seen: unknown[] = [];
    const stop = $effect.root(() => {
      $effect(() => {
        seen.push([
          state.values.email,
          state.getError("email"),
          state.touched.email,
          state.isSubmitted,
        ]);
      });
    });
    flushSync();
    state.setValue("email", "");
    state.blur("email");
    submit(state);
    flushSync();
    state.reset();
    flushSync();
    expect(seen).toEqual([
      ["ada@example.com", undefined, undefined, false],
      ["", "Email is required", true, true],
      ["ada@example.com", undefined, undefined, false],
    ]);
    expect(state.values).toEqual({ email: "ada@example.com" });
    stop();
  });
});
