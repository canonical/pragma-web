import { flushSync } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import RemoteValidation from "../../../testing/RemoteValidation.fixtures.svelte";
import { VALIDITY_EVENT } from "../../common/constants.js";
import type { RemoteCheck } from "./types.js";

/** Returns a promise with its resolve and reject functions. */
function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

/** A check that answers each value from a table, or `undefined` (valid). */
const answerFrom =
  (answers: Record<string, string>): RemoteCheck =>
  async (value) =>
    answers[value];

const fast = { debounceWait: 0 };

async function renderField(props: Record<string, unknown>) {
  const page = await render(RemoteValidation, props);
  const input = page.container.querySelector("input") as HTMLInputElement;
  const readError = () =>
    page.container.querySelector(".field-error")?.textContent ?? null;
  return { page, input, readError };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("validateRemotely", () => {
  it("sets the rejection as the custom validity and Field shows it", async () => {
    const { input, readError } = await renderField({
      validator: answerFrom({ taken: "Name taken" }),
      options: fast,
    });
    await userEvent.fill(input, "taken");
    await expect.poll(readError).toBe("Name taken");
    expect(input.validity.customError).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("clears the message on a valid answer and tells the field", async () => {
    const { input, readError } = await renderField({
      validator: answerFrom({ taken: "Name taken" }),
      options: fast,
    });
    const onValidity = vi.fn();
    input.addEventListener(VALIDITY_EVENT, onValidity);
    await userEvent.fill(input, "taken");
    await expect.poll(readError).toBe("Name taken");
    await userEvent.fill(input, "free");
    await expect.poll(readError).toBeNull();
    expect(input.validity.valid).toBe(true);
    expect(onValidity).toHaveBeenCalledOnce();
  });

  it("checks a value only once it reaches minLength, and a short one clears", async () => {
    const check = vi.fn(answerFrom({ abcd: "Bad" }));
    const { input, readError } = await renderField({
      validator: check,
      options: { ...fast, minLength: 4 },
    });
    await userEvent.fill(input, "abc");
    await userEvent.fill(input, "abcd");
    await expect.poll(readError).toBe("Bad");
    expect(check).toHaveBeenCalledOnce();
    await userEvent.fill(input, "ab");
    await expect.poll(readError).toBeNull();
    expect(input.validity.valid).toBe(true);
  });

  it("debounces, and only the answer for the latest value counts", async () => {
    const slow = createDeferred<string | undefined>();
    const check = vi.fn((value: string) =>
      value === "first" ? slow.promise : Promise.resolve(undefined),
    );
    const { input, readError } = await renderField({
      validator: check,
      options: { debounceWait: 200 },
    });
    /** Types a value in one go, as `fill` does, without its delay. */
    const type = (value: string) => {
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    type("draft");
    type("first");
    await expect.poll(() => check.mock.calls.length).toBe(1);
    const [, firstSignal] = check.mock.calls[0] as unknown as [
      string,
      AbortSignal,
    ];
    type("second");
    expect(firstSignal.aborted).toBe(true);
    await expect.poll(() => check.mock.calls.length).toBe(2);
    slow.resolve("Stale rejection");
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(readError()).toBeNull();
    expect(check.mock.calls.map(([value]) => value)).toEqual([
      "first",
      "second",
    ]);
  });

  it("does not check the same value again on change", async () => {
    const check = vi.fn(answerFrom({}));
    const { input } = await renderField({ validator: check, options: fast });
    await userEvent.fill(input, "same");
    await expect.poll(() => check.mock.calls.length).toBe(1);
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(check).toHaveBeenCalledOnce();
  });

  it("keeps the previous message when a check fails, and asks again later", async () => {
    let isOffline = false;
    const check = vi.fn(async (value: string) => {
      if (isOffline) throw new Error("offline");
      return value === "taken" ? "Name taken" : undefined;
    });
    const { input, readError } = await renderField({
      validator: check,
      options: fast,
    });
    await userEvent.fill(input, "taken");
    await expect.poll(readError).toBe("Name taken");
    isOffline = true;
    await userEvent.fill(input, "other");
    await expect.poll(() => check.mock.calls.length).toBe(2);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(readError()).toBe("Name taken");
    isOffline = false;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await expect.poll(readError).toBeNull();
    expect(check).toHaveBeenCalledTimes(3);
  });

  it("gives up on a check after the timeout and keeps the previous message", async () => {
    const signals: AbortSignal[] = [];
    const check = vi.fn((value: string, signal: AbortSignal) => {
      signals.push(signal);
      return value === "taken"
        ? Promise.resolve("Name taken")
        : new Promise<undefined>(() => {});
    });
    const { input, readError } = await renderField({
      validator: check,
      options: { ...fast, timeout: 20 },
    });
    await userEvent.fill(input, "taken");
    await expect.poll(readError).toBe("Name taken");
    await userEvent.fill(input, "hanging");
    await expect.poll(() => signals.at(1)?.aborted).toBe(true);
    expect(readError()).toBe("Name taken");
  });

  it("posts the value to a REST endpoint and reads the rejection", async () => {
    const fetch = vi.fn(async (_url: string, init: RequestInit) => {
      const { value } = JSON.parse(init.body as string) as { value: string };
      return value === "taken"
        ? Response.json({ error: "Name taken" }, { status: 400 })
        : new Response(null, { status: 200 });
    });
    vi.stubGlobal("fetch", fetch);
    const { input, readError } = await renderField({
      validator: "/api/validate",
      options: {
        ...fast,
        errorExtractor: async (response: Response) =>
          ((await response.json()) as { error: string }).error,
      },
    });
    await userEvent.fill(input, "taken");
    await expect.poll(readError).toBe("Name taken");
    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/validate");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(init.body).toBe(JSON.stringify({ value: "taken" }));
    await userEvent.fill(input, "free");
    await expect.poll(readError).toBeNull();
  });

  it("uses the REST options, and the default message when none is readable", async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 422 }));
    vi.stubGlobal("fetch", fetch);
    const first = await renderField({
      validator: "/api/check",
      options: {
        ...fast,
        method: "PUT",
        headers: { "X-Test": "1" },
        bodyFormatter: (value: string) => ({ name: value }),
      },
    });
    await userEvent.fill(first.input, "anyone");
    await expect.poll(first.readError).toBe("Validation failed");
    expect(fetch.mock.calls[0]).toEqual([
      "/api/check",
      expect.objectContaining({
        method: "PUT",
        headers: { "X-Test": "1" },
        body: JSON.stringify({ name: "anyone" }),
      }),
    ]);
    first.page.unmount();
    const second = await renderField({
      validator: "/api/check",
      options: {
        ...fast,
        errorExtractor: () => {
          throw new Error("unreadable");
        },
      },
    });
    await userEvent.fill(second.input, "anyone");
    await expect.poll(second.readError).toBe("Validation failed");
  });

  it("keeps each instance's own message on one control", async () => {
    const { input, readError } = await renderField({
      validator: answerFrom({ ab1: "First rejects", both: "First rejects" }),
      second: answerFrom({ ab2: "Second rejects", both: "Second rejects" }),
      options: fast,
    });
    await userEvent.fill(input, "both");
    await expect.poll(readError).toBe("First rejects");
    await userEvent.fill(input, "ab2");
    await expect.poll(readError).toBe("Second rejects");
    await userEvent.fill(input, "ab1");
    await expect.poll(readError).toBe("First rejects");
    await userEvent.fill(input, "none");
    await expect.poll(readError).toBeNull();
  });

  it("keeps the message across a re-run, and clears it when removed", async () => {
    const { page, input, readError } = await renderField({
      validator: answerFrom({ taken: "Name taken" }),
      options: fast,
    });
    await userEvent.fill(input, "taken");
    await expect.poll(readError).toBe("Name taken");
    const hanging = vi.fn(() => new Promise<undefined>(() => {}));
    await page.rerender({ validator: hanging, options: fast });
    await expect.poll(() => hanging.mock.calls.length).toBe(1);
    await Promise.resolve();
    expect(input.validity.customError).toBe(true);
    expect(readError()).toBe("Name taken");
    await page.rerender({ validator: undefined });
    await expect.poll(() => input.validity.customError).toBe(false);
    await expect.poll(readError).toBeNull();
  });

  it("clears nothing when removed without a message", async () => {
    const { page, input } = await renderField({
      validator: answerFrom({}),
      options: fast,
    });
    const onValidity = vi.fn();
    input.addEventListener(VALIDITY_EVENT, onValidity);
    await page.rerender({ validator: undefined });
    await Promise.resolve();
    expect(onValidity).not.toHaveBeenCalled();
  });
});

describe("validateRemotely on submit", () => {
  it("holds a submit until the value is checked, then submits a valid value once", async () => {
    const answer = createDeferred<string | undefined>();
    const onsubmit = vi.fn();
    const { page, input } = await renderField({
      validator: () => answer.promise,
      options: fast,
      onsubmit,
    });
    const form = page.container.querySelector("form") as HTMLFormElement;
    const button = page.container.querySelector("button") as HTMLButtonElement;
    input.value = "fresh";
    button.click();
    button.click();
    expect(onsubmit).not.toHaveBeenCalled();
    answer.resolve(undefined);
    await expect
      .poll(() => onsubmit.mock.calls.length, { timeout: 3000 })
      .toBe(1);
    expect((onsubmit.mock.calls[0] as [SubmitEvent])[0].submitter).toBe(button);
    form.requestSubmit();
    expect(onsubmit).toHaveBeenCalledTimes(2);
  });

  it("does not submit a value the check rejects", async () => {
    const onsubmit = vi.fn();
    const onInvalid = vi.fn();
    const { page, input, readError } = await renderField({
      validator: answerFrom({ taken: "Name taken" }),
      options: { debounceWait: 0 },
      onsubmit,
    });
    input.addEventListener("invalid", onInvalid);
    const form = page.container.querySelector("form") as HTMLFormElement;
    input.value = "taken";
    form.requestSubmit();
    await expect.poll(readError).toBe("Name taken");
    expect(onInvalid).toHaveBeenCalled();
    expect(onsubmit).not.toHaveBeenCalled();
  });

  it("stops a rejected value in a form without native validation", async () => {
    const onsubmit = vi.fn();
    const { page, input, readError } = await renderField({
      validator: answerFrom({ taken: "Name taken" }),
      options: fast,
      novalidate: true,
      onsubmit,
    });
    const form = page.container.querySelector("form") as HTMLFormElement;
    input.value = "taken";
    form.requestSubmit();
    await expect.poll(readError).toBe("Name taken");
    form.requestSubmit();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(onsubmit).not.toHaveBeenCalled();
    await userEvent.fill(input, "free");
    await expect.poll(readError).toBeNull();
    form.requestSubmit();
    expect(onsubmit).toHaveBeenCalledOnce();
  });

  it("submits without its submitter when the submitter left meanwhile", async () => {
    const answer = createDeferred<string | undefined>();
    const onsubmit = vi.fn();
    const { page, input } = await renderField({
      validator: () => answer.promise,
      options: fast,
      onsubmit,
    });
    const button = page.container.querySelector("button") as HTMLButtonElement;
    input.value = "fresh";
    button.click();
    const parent = button.parentNode as Node;
    button.remove();
    answer.resolve(undefined);
    await expect.poll(() => onsubmit.mock.calls.length).toBe(1);
    expect((onsubmit.mock.calls[0] as [SubmitEvent])[0].submitter).toBeNull();
    parent.appendChild(button);
  });

  it("submits a held submit when the field leaves the form", async () => {
    const onsubmit = vi.fn();
    const { page, input } = await renderField({
      validator: () => new Promise<undefined>(() => {}),
      options: fast,
      novalidate: true,
      onsubmit,
    });
    const form = page.container.querySelector("form") as HTMLFormElement;
    input.value = "fresh";
    form.requestSubmit();
    expect(onsubmit).not.toHaveBeenCalled();
    await page.rerender({ condition: () => false });
    flushSync();
    expect(input.isConnected).toBe(false);
    await expect.poll(() => onsubmit.mock.calls.length).toBe(1);
  });

  it("lets a value too short to check through", async () => {
    const onsubmit = vi.fn();
    const { page, input } = await renderField({
      validator: answerFrom({}),
      options: fast,
      novalidate: true,
      onsubmit,
    });
    input.value = "ab";
    (page.container.querySelector("form") as HTMLFormElement).requestSubmit();
    expect(onsubmit).toHaveBeenCalledOnce();
  });

  it("ignores submits of other forms, and works outside a form", async () => {
    const check = vi.fn(answerFrom({}));
    const { page } = await renderField({
      validator: check,
      options: fast,
      isInForm: false,
    });
    const other = document.createElement("form");
    const onOther = vi.fn((event: Event) => event.preventDefault());
    other.addEventListener("submit", onOther);
    document.body.append(other);
    other.requestSubmit();
    expect(onOther).toHaveBeenCalledOnce();
    await page.rerender({ isInForm: true });
    other.requestSubmit();
    expect(onOther).toHaveBeenCalledTimes(2);
    other.remove();
  });
});
