import type { IndexedDBFactory } from "@canonical/dataviews-core/indexeddb";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import useStoryViewStore from "./useStoryViewStore.js";

/** A factory refusing every open, as a browser refusing storage does. */
const refusing = (): IndexedDBFactory & { readonly names: string[] } => {
  const names: string[] = [];
  return {
    names,
    open(name) {
      names.push(name);
      const request = {
        result: undefined,
        error: new Error("refused"),
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
      } as unknown as ReturnType<IndexedDBFactory["open"]>;
      queueMicrotask(() => {
        const onError = request.onerror as ((event: Event) => void) | null;
        onError?.(new Event("error"));
      });
      return request;
    },
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useStoryViewStore", () => {
  it("opens a store of the story's own, and another tab over the same database", async () => {
    const factory = refusing();
    const hook = renderHook(() => useStoryViewStore({ indexedDB: factory }));
    const { store, openAnotherTab } = hook.result.current;
    expect(openAnotherTab()).not.toBe(store);
    // A store opens its database on first use.
    await store.list().catch(() => {});
    await openAnotherTab()
      .list()
      .catch(() => {});
    expect(factory.names).toHaveLength(2);
    expect(factory.names[0]).toMatch(/^dataviews-story-views-/);
    expect(factory.names[1]).toBe(factory.names[0]);
  });

  it("seeds the store once, leaving refused storage to the control, and deletes it on unmount", async () => {
    const deleteDatabase = vi.fn();
    vi.stubGlobal("indexedDB", { deleteDatabase });
    const factory = refusing();
    const hook = renderHook(() =>
      useStoryViewStore({
        indexedDB: factory,
        seed: [
          {
            id: "v1",
            name: "Failed",
            query: "status=failed",
            presentation: {},
          },
        ],
      }),
    );
    await vi.waitFor(() => {
      expect(factory.names).toHaveLength(1);
    });
    hook.unmount();
    expect(deleteDatabase).toHaveBeenCalledWith(factory.names[0]);
  });
});
