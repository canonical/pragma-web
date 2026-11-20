import { describe, expect, it, vi } from "vitest";
import buildStoredView from "./buildStoredView.js";
import createMemoryViewStore from "./createMemoryViewStore.js";

describe("createMemoryViewStore", () => {
  it("lists, finds and creates views, telling every listener", async () => {
    const { store } = createMemoryViewStore([buildStoredView()]);
    const listener = vi.fn();
    const stop = store.subscribe(listener);
    expect((await store.list()).views).toHaveLength(1);
    expect(await store.get("v1")).toMatchObject({ status: "found" });
    expect(await store.get("v9")).toEqual({ status: "missing" });
    const created = await store.create({
      id: "v2",
      name: "Mine",
      query: "status=running",
      presentation: {},
    });
    expect(created).toMatchObject({ status: "saved", view: { id: "v2" } });
    expect(listener).toHaveBeenCalledTimes(1);
    stop();
    await store.create({ id: "v3", name: "x", query: "", presentation: {} });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("updates and removes at the revision read, and conflicts past it", async () => {
    const { store } = createMemoryViewStore([buildStoredView()]);
    expect(
      await store.update({ id: "v1", revision: 1 }, { name: "Renamed" }),
    ).toMatchObject({
      status: "saved",
      view: { name: "Renamed", revision: 2 },
    });
    expect(
      await store.update({ id: "v1", revision: 1 }, { name: "Stale" }),
    ).toMatchObject({ status: "conflict" });
    expect(
      await store.update({ id: "v9", revision: 1 }, { name: "Gone" }),
    ).toEqual({ status: "missing" });
    expect(await store.remove({ id: "v1", revision: 1 })).toMatchObject({
      status: "conflict",
    });
    expect(await store.remove({ id: "v1", revision: 2 })).toEqual({
      status: "removed",
    });
    expect(await store.pin("v1")).toEqual({
      status: "saved",
    });
    expect(await store.unpin("v1")).toEqual({
      status: "saved",
    });
    store.dispose();
  });

  it("changes and drops records as another tab would", async () => {
    const memory = createMemoryViewStore([buildStoredView()]);
    const listener = vi.fn();
    memory.store.subscribe(listener);
    memory.elsewhere("v1", { name: "Theirs" });
    expect(await memory.store.get("v1")).toMatchObject({
      view: { name: "Theirs", revision: 2 },
    });
    memory.elsewhere("v9", { name: "Nobody" });
    memory.drop("v1");
    expect(await memory.store.get("v1")).toEqual({ status: "missing" });
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
