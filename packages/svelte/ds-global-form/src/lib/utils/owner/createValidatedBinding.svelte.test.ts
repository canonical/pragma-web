import { describe, expect, it, vi } from "vitest";
import createFormState from "./createFormState.svelte.js";
import createValidatedBinding from "./createValidatedBinding.js";

/** A validator whose calls the test settles by hand. */
function createManualValidator() {
  const calls: {
    value: string;
    signal: AbortSignal;
    resolve: (message: string | undefined) => void;
    reject: (error: unknown) => void;
  }[] = [];
  const validate = (value: string, signal: AbortSignal) =>
    new Promise<string | undefined>((resolve, reject) =>
      calls.push({ value, signal, resolve, reject }),
    );
  return { calls, validate };
}

const settle = () => new Promise((resolve) => setTimeout(resolve));

describe("createValidatedBinding", () => {
  it("checks a written value and keeps only the latest message", async () => {
    const { calls, validate } = createManualValidator();
    const owner = createValidatedBinding(
      createFormState({ defaultValues: { username: "", bio: "" } }),
      { username: validate },
    );
    owner.setValue("username", "ad");
    owner.setValue("username", "ada");
    expect(calls.at(0)?.signal.aborted).toBe(true);
    calls.at(1)?.resolve("Taken");
    calls.at(0)?.resolve("Stale");
    await settle();
    expect(owner.getError?.("username")).toBe("Taken");
    owner.setValue("bio", "hello");
    expect(owner.values).toEqual({ username: "ada", bio: "hello" });
    expect(calls).toHaveLength(2);
  });

  it("keeps the previous message while a check runs, and when it fails", async () => {
    const { calls, validate } = createManualValidator();
    const owner = createValidatedBinding(
      createFormState({ defaultValues: { username: "" } }),
      { username: validate },
    );
    owner.setValue("username", "ada");
    calls.at(0)?.resolve("Taken");
    await settle();
    owner.setValue("username", "adb");
    expect(owner.getError?.("username")).toBe("Taken");
    calls.at(1)?.reject(new Error("offline"));
    await settle();
    expect(owner.getError?.("username")).toBe("Taken");
    owner.setValue("username", "adc");
    calls.at(2)?.resolve(undefined);
    await settle();
    expect(owner.getError?.("username")).toBeUndefined();
  });

  it("falls back to the owner's own errors and blur", () => {
    const owner = createValidatedBinding(
      createFormState({
        defaultValues: { email: "" },
        validate: () => ({ email: "Required" }),
        mode: "onBlur",
      }),
      {},
    );
    owner.blur?.("email");
    expect(owner.getError?.("email")).toBe("Required");
  });

  it("passes no error, blur or submit from an owner without them", () => {
    const values = $state({ email: "" });
    const owner = createValidatedBinding(
      {
        values,
        setValue: (name, value) => {
          values[name] = value ?? "";
        },
        reset: () => {
          values.email = "";
        },
      },
      {},
    );
    expect(owner.blur).toBeUndefined();
    expect(owner.getError?.("email")).toBeUndefined();
    const event = new SubmitEvent("submit", { cancelable: true });
    owner.submit?.(event);
    expect(event.defaultPrevented).toBe(false);
    owner.setValue("email", "a");
    owner.reset();
    expect(values.email).toBe("");
  });

  it("stops a submit while a check's message shows, and passes it on otherwise", async () => {
    const { calls, validate } = createManualValidator();
    const inner = createFormState({ defaultValues: { username: "" } });
    const innerSubmit = vi.spyOn(inner, "submit");
    const owner = createValidatedBinding(inner, { username: validate });
    owner.setValue("username", "ada");
    calls.at(0)?.resolve("Taken");
    await settle();
    const blocked = new SubmitEvent("submit", { cancelable: true });
    owner.submit?.(blocked);
    expect(blocked.defaultPrevented).toBe(true);
    expect(innerSubmit).not.toHaveBeenCalled();
    owner.setValue("username", "bob");
    calls.at(1)?.resolve(undefined);
    await settle();
    const passed = new SubmitEvent("submit", { cancelable: true });
    owner.submit?.(passed);
    expect(innerSubmit).toHaveBeenCalledWith(passed);
  });

  it("cancels every check and clears its messages on reset", async () => {
    const { calls, validate } = createManualValidator();
    const owner = createValidatedBinding(
      createFormState({ defaultValues: { username: "initial" } }),
      { username: validate },
    );
    owner.setValue("username", "ada");
    calls.at(0)?.resolve("Taken");
    await settle();
    owner.setValue("username", "bob");
    owner.reset();
    expect(calls.at(1)?.signal.aborted).toBe(true);
    calls.at(1)?.resolve("Late");
    await settle();
    expect(owner.getError?.("username")).toBeUndefined();
    expect(owner.values.username).toBe("initial");
  });

  it("validates every checked field, waiting for edits made meanwhile", async () => {
    const { calls, validate } = createManualValidator();
    const owner = createValidatedBinding(
      createFormState({ defaultValues: { username: "ada" } }),
      {
        username: validate,
      },
    );
    const result = owner.validate();
    owner.setValue("username", "bob");
    calls.at(0)?.resolve(undefined);
    await settle();
    calls.at(1)?.resolve("Taken");
    expect(await result).toBe(false);
    const again = owner.validate();
    calls.at(2)?.resolve(undefined);
    expect(await again).toBe(true);
  });
});
