/**
 * The prefetch contract every route's `warm` relies on: fetch only when an
 * environment is published, never refetch what the store already holds,
 * collapse quick repeat calls into one request, settle with the fetch, and
 * read the environment at the moment of the call.
 *
 * Driven through a compiled operation against real `createEnvironment`
 * instances. The only test double is the fetch function, so "one fetch"
 * means one actual network dispatch.
 */

import type { FetchFunction } from "relay-runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import { PING_QUERY, PING_RESPONSE } from "../../../testing/fixtures.js";
import { createEnvironment } from "./createEnvironment.js";
import {
  getPrefetchEnvironment,
  setPrefetchEnvironment,
} from "./prefetchEnvironment.js";
import prefetchQuery from "./prefetchQuery.js";

afterEach(() => {
  // The holder is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("prefetchQuery", () => {
  it("resolves and fetches nothing when no environment is published", async () => {
    const fetchFn = createFetchSpy();
    createEnvironment({ fetchFn });

    await expect(prefetchQuery(PING_QUERY, {})).resolves.toBeUndefined();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("fetches once against an empty store", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void prefetchQuery(PING_QUERY, {});

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("resolves without fetching when the store already holds the data", async () => {
    const fetchFn = vi.fn<FetchFunction>(() => Promise.resolve(PING_RESPONSE));
    setPrefetchEnvironment(createEnvironment({ fetchFn }));
    await prefetchQuery(PING_QUERY, {});

    await expect(prefetchQuery(PING_QUERY, {})).resolves.toBeUndefined();
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("collapses two quick calls into one request", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void prefetchQuery(PING_QUERY, {});
    void prefetchQuery(PING_QUERY, {});

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("resolves when the fetch completes", async () => {
    const fetchFn = vi.fn<FetchFunction>(() => Promise.resolve(PING_RESPONSE));
    const environment = createEnvironment({ fetchFn });
    setPrefetchEnvironment(environment);

    await expect(prefetchQuery(PING_QUERY, {})).resolves.toBeUndefined();
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("rejects with the fetch's error when the fetch fails", async () => {
    const failure = new Error("graph unreachable");
    const fetchFn = vi.fn<FetchFunction>(() => Promise.reject(failure));
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    await expect(prefetchQuery(PING_QUERY, {})).rejects.toBe(failure);
  });

  it("reads the environment at call time, not after", () => {
    // The server publishes its per-request environment only while a route's
    // `warm` runs synchronously, then clears it before awaiting. The fetch
    // must already be bound to that environment by the time it is cleared.
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void prefetchQuery(PING_QUERY, {});
    setPrefetchEnvironment(undefined);

    expect(getPrefetchEnvironment()).toBeUndefined();
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
