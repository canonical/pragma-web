import { describe, expect, it } from "vitest";
import createStandInPresentationStore from "./createStandInPresentationStore.js";

describe("createStandInPresentationStore", () => {
  it("reads nothing, saves, and hears nobody by default", async () => {
    const store = createStandInPresentationStore();
    await expect(store.readPresentation("default")).resolves.toEqual({});
    await expect(store.patchPresentation("default", {})).resolves.toEqual({
      status: "saved",
    });
    expect(store.subscribe(() => {})()).toBeUndefined();
  });

  it("answers as an override says", async () => {
    const store = createStandInPresentationStore({
      patchPresentation: async () => ({ status: "missing" }),
    });
    await expect(store.patchPresentation("default", {})).resolves.toEqual({
      status: "missing",
    });
  });
});
