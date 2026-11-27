import { describe, expect, it, vi } from "vitest";
import fetchOptions from "./fetchOptions.js";

const fruits = [{ value: "apple", label: "Apple" }];

describe("fetchOptions", () => {
  it("gets the options with the global fetch by default", async () => {
    const fetch = vi.fn(async () => Response.json(fruits));
    vi.stubGlobal("fetch", fetch);
    try {
      expect(await fetchOptions("/api/fruits")).toEqual(fruits);
      expect(fetch).toHaveBeenCalledWith("/api/fruits", {
        method: "GET",
        headers: {},
        signal: undefined,
      });
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("uses the given fetch, request options and transform", async () => {
    const fetch = vi.fn(async () => Response.json({ items: fruits }));
    const signal = new AbortController().signal;
    const options = await fetchOptions("/api/fruits", {
      fetch,
      method: "POST",
      headers: { Accept: "application/json" },
      signal,
      transformData: (data: { items: typeof fruits }) => data.items,
    });
    expect(options).toEqual(fruits);
    expect(fetch).toHaveBeenCalledWith("/api/fruits", {
      method: "POST",
      headers: { Accept: "application/json" },
      signal,
    });
  });

  it("rejects a response that is not OK", async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 500 }));
    await expect(fetchOptions("/api/fruits", { fetch })).rejects.toThrow(
      "Failed to fetch options",
    );
  });
});
