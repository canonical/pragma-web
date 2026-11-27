import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import RemoteOptions from "../../../testing/RemoteOptions.fixtures.svelte";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "pear", label: "Pear" },
];

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

async function renderOptions(props: Record<string, unknown>) {
  const page = await render(RemoteOptions, props);
  const select = () =>
    page.container.querySelector("select") as HTMLSelectElement;
  const readState = () =>
    JSON.parse(page.getByTestId("state").element().textContent ?? "{}");
  const readError = () =>
    page.container.querySelector(".field-error")?.textContent ?? null;
  return { page, select, readState, readError };
}

describe("createRemoteOptions", () => {
  it("keeps the field disabled and busy while loading, then gives the options", async () => {
    const response = createDeferred<Response>();
    const fetch = vi.fn((_url: string, _init: RequestInit) => response.promise);
    const { select, readState } = await renderOptions({
      url: "/api/fruits",
      options: { fetch },
    });
    expect(select().disabled).toBe(true);
    expect(select().getAttribute("aria-busy")).toBe("true");
    expect(readState()).toEqual({ isLoading: true, error: null, options: [] });
    response.resolve(Response.json(fruits));
    await expect.poll(() => readState().options).toEqual(["apple", "pear"]);
    expect(select().disabled).toBe(false);
    expect(select().hasAttribute("aria-busy")).toBe(false);
    expect(select().options.length).toBe(2);
    expect(fetch.mock.calls[0]?.[0]).toBe("/api/fruits");
  });

  it("shows a failed request as the field's error and leaves it enabled", async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 500 }));
    const { select, readError } = await renderOptions({
      url: "/api/fruits",
      options: { fetch },
    });
    await expect.poll(readError).toBe("Failed to fetch options");
    expect(select().disabled).toBe(false);
    expect(select().getAttribute("aria-invalid")).toBe("true");
  });

  it("shows a rejection that is not an error as text", async () => {
    const fetch = vi.fn(() => Promise.reject("offline"));
    const { readError } = await renderOptions({
      url: "/api/fruits",
      options: { fetch },
    });
    await expect.poll(readError).toBe("offline");
  });

  it("clears the options and error on a new URL and drops stale answers", async () => {
    const responses = new Map([
      ["/api/broken", createDeferred<Response>()],
      ["/api/stale", createDeferred<Response>()],
      ["/api/stale-error", createDeferred<Response>()],
      ["/api/fresh", createDeferred<Response>()],
    ]);
    const signals: AbortSignal[] = [];
    const fetch = vi.fn((url: string, init: RequestInit) => {
      signals.push(init.signal as AbortSignal);
      return (responses.get(url) as ReturnType<typeof createDeferred<Response>>)
        .promise;
    });
    const { page, readState, readError } = await renderOptions({
      url: "/api/broken",
      options: { fetch },
    });
    responses.get("/api/broken")?.reject(new Error("Broken"));
    await expect.poll(readError).toBe("Broken");
    await page.rerender({ url: "/api/stale" });
    expect(readState()).toEqual({ isLoading: true, error: null, options: [] });
    expect(readError()).toBeNull();
    await page.rerender({ url: "/api/stale-error" });
    await page.rerender({ url: "/api/fresh" });
    expect(signals.slice(1, 3).map((signal) => signal.aborted)).toEqual([
      true,
      true,
    ]);
    responses.get("/api/stale")?.resolve(Response.json([fruits[0]]));
    responses.get("/api/stale-error")?.reject(new Error("Stale"));
    responses.get("/api/fresh")?.resolve(Response.json([fruits[1]]));
    await expect.poll(() => readState().options).toEqual(["pear"]);
    expect(readError()).toBeNull();
  });
});
