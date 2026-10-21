/**
 * The prefetch contract every route's `warm` relies on: fetch only when an
 * environment is published, never refetch what the store already holds,
 * collapse quick repeat calls into one request, settle with the fetch, and
 * read the environment at the moment of the call.
 *
 * Driven through the playground's real compiled operation against real
 * `createEnvironment` instances. The only test double is the fetch
 * function, so "one fetch" means one actual network dispatch.
 */

import type { FetchFunction } from "relay-runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  componentProbeQueryNode,
  componentProbeVariables,
} from "#domains/playground";
import createFetchSpy from "../../testing/createFetchSpy.js";
import componentProbeRecords from "../domains/playground/__fixtures__/componentProbeRecords.js";
import { createEnvironment } from "./environment.js";
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

    await expect(
      prefetchQuery(componentProbeQueryNode, componentProbeVariables()),
    ).resolves.toBeUndefined();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("fetches once against an empty store", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void prefetchQuery(componentProbeQueryNode, componentProbeVariables());

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("resolves without fetching when the store already holds the data", async () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(
      createEnvironment({ records: componentProbeRecords, fetchFn }),
    );

    await expect(
      prefetchQuery(componentProbeQueryNode, componentProbeVariables()),
    ).resolves.toBeUndefined();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("collapses two quick calls into one request", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void prefetchQuery(componentProbeQueryNode, componentProbeVariables());
    void prefetchQuery(componentProbeQueryNode, componentProbeVariables());

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("resolves when the fetch completes", async () => {
    const fetchFn = vi.fn<FetchFunction>(() =>
      Promise.resolve({ data: { component: null } }),
    );
    const environment = createEnvironment({ fetchFn });
    setPrefetchEnvironment(environment);

    await expect(
      prefetchQuery(componentProbeQueryNode, componentProbeVariables()),
    ).resolves.toBeUndefined();
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("rejects with the fetch's error when the fetch fails", async () => {
    const failure = new Error("graph unreachable");
    const fetchFn = vi.fn<FetchFunction>(() => Promise.reject(failure));
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    await expect(
      prefetchQuery(componentProbeQueryNode, componentProbeVariables()),
    ).rejects.toBe(failure);
  });

  it("reads the environment at call time, not after", () => {
    // The server publishes its per-request environment only while a route's
    // `warm` runs synchronously, then clears it before awaiting. The fetch
    // must already be bound to that environment by the time it is cleared.
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void prefetchQuery(componentProbeQueryNode, componentProbeVariables());
    setPrefetchEnvironment(undefined);

    expect(getPrefetchEnvironment()).toBeUndefined();
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
