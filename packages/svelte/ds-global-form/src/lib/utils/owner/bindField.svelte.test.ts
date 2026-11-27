import { describe, expect, it, vi } from "vitest";
import bindField from "./bindField.js";
import createFormState from "./createFormState.svelte.js";

describe("bindField", () => {
  it("reads the field's error from the owner, and blurs it", () => {
    const owner = createFormState({
      defaultValues: { email: "" },
      validate: (values) => ({
        email: values.email ? undefined : "Required",
      }),
      mode: "onTouched",
    });
    const binding = bindField(owner, "email");
    expect(binding.error).toBeUndefined();
    binding.onblur();
    expect(owner.touched.email).toBe(true);
    expect(binding.error).toBe("Required");
    owner.setValue("email", "a@b.c");
    expect(binding.error).toBeUndefined();
  });

  it("reads nothing from an owner with values only", () => {
    const setValue = vi.fn();
    const binding = bindField<Record<string, unknown>>(
      { values: {}, setValue },
      "email",
    );
    binding.onblur();
    expect(binding).toMatchObject({ error: undefined });
  });
});
