import { describe, expect, it, vi } from "vitest";
import buildStoredView from "./buildStoredView.js";
import createCountingViewStore from "./createCountingViewStore.js";

const REVISION = { id: "v", revision: 1 };

describe("createCountingViewStore", () => {
  it("holds nothing and refuses every write", async () => {
    const { store } = createCountingViewStore();
    await expect(store.list()).resolves.toEqual({ views: [], unreadable: [] });
    await expect(store.get("v")).resolves.toEqual({ status: "missing" });
    await expect(store.create(buildStoredView())).resolves.toEqual({
      status: "unreadable",
      reason: "read-only",
    });
    await expect(store.update(REVISION, {})).resolves.toEqual({
      status: "missing",
    });
    await expect(store.remove(REVISION)).resolves.toEqual({
      status: "unreadable",
      reason: "read-only",
    });
    await expect(store.pin("v")).resolves.toEqual({ status: "missing" });
    await expect(store.unpin("v")).resolves.toEqual({ status: "missing" });
  });

  it("counts the listeners subscribed, released and disposed", () => {
    const onSubscribe = vi.fn();
    const counting = createCountingViewStore({ onSubscribe });
    const release = counting.store.subscribe(() => {});
    counting.store.subscribe(() => {});
    expect(onSubscribe).toHaveBeenCalledTimes(2);
    expect(counting.subscribers).toBe(2);
    release();
    expect(counting.subscribers).toBe(1);
    counting.store.dispose();
    expect(counting.subscribers).toBe(0);
  });
});
