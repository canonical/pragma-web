import { describe, expect, it } from "vitest";
import buildStoredView from "./buildStoredView.js";
import createStandInViewStore from "./createStandInViewStore.js";

const REVISION = { id: "v", revision: 1 };

describe("createStandInViewStore", () => {
  it("lists and finds nothing, and refuses to create, by default", async () => {
    const store = createStandInViewStore();
    await expect(store.list()).resolves.toEqual({ views: [], unreadable: [] });
    await expect(store.get("v")).resolves.toEqual({ status: "missing" });
    await expect(store.create(buildStoredView())).rejects.toThrow(
      "not used in this test",
    );
    await expect(store.update(REVISION, {})).resolves.toEqual({
      status: "missing",
    });
    await expect(store.remove(REVISION)).resolves.toEqual({
      status: "removed",
    });
    await expect(store.pin("v")).resolves.toEqual({ status: "saved" });
    await expect(store.unpin("v")).resolves.toEqual({ status: "saved" });
    expect(store.subscribe(() => {})()).toBeUndefined();
    expect(store.dispose()).toBeUndefined();
  });

  it("answers as an override says", async () => {
    const store = createStandInViewStore({
      pin: async () => ({ status: "missing" }),
    });
    await expect(store.pin("v")).resolves.toEqual({ status: "missing" });
  });
});
