import { flushSync } from "svelte";
import { describe, expect, it } from "vitest";
import createBinding from "./createBinding.js";
import type { BindingSource } from "./types.js";

/** A store that is not reactive under runes: plain fields and listeners. */
function createPlainStore(): BindingSource<{ email: string }> & {
  listeners: Set<() => void>;
  blurred: string[];
  submitted: SubmitEvent[];
} {
  const listeners = new Set<() => void>();
  const blurred: string[] = [];
  const submitted: SubmitEvent[] = [];
  let values = { email: "" };
  return {
    listeners,
    blurred,
    submitted,
    getValues: () => values,
    setValue(name, value) {
      values = { ...values, [name]: value };
      for (const notify of listeners) notify();
    },
    subscribe(notify) {
      listeners.add(notify);
      return () => listeners.delete(notify);
    },
    getError: () => (values.email ? undefined : "Required"),
    blur: (name) => blurred.push(name),
    submit: (event) => submitted.push(event),
  };
}

describe("createBinding", () => {
  it("makes a plain store's reads reactive while an effect reads them", () => {
    const store = createPlainStore();
    const owner = createBinding(store);
    const seen: unknown[] = [];
    const stop = $effect.root(() => {
      $effect(() => {
        seen.push([owner.values.email, owner.getError?.("email")]);
      });
    });
    flushSync();
    expect(store.listeners.size).toBe(1);
    owner.setValue("email", "a@b.c");
    owner.blur?.("email");
    const event = new SubmitEvent("submit");
    owner.submit?.(event);
    store.setValue("email", "c@d.e");
    flushSync();
    expect(seen).toEqual([
      ["", "Required"],
      ["c@d.e", undefined],
    ]);
    expect(store.blurred).toEqual(["email"]);
    expect(store.submitted).toEqual([event]);
    stop();
    flushSync();
    expect(store.listeners.size).toBe(0);
  });

  it("reads no error, and ignores blur and submit, from a store with values only", () => {
    const { getError: _e, blur: _b, submit: _s, ...store } = createPlainStore();
    const owner = createBinding(store);
    owner.blur?.("email");
    owner.submit?.(new SubmitEvent("submit"));
    expect(owner.getError?.("email")).toBeUndefined();
  });
});
