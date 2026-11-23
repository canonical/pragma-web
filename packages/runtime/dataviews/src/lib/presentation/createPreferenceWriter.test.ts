import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createDeferred from "../../../testing/createDeferred.js";
import createStandInPresentationStore from "../../../testing/createStandInPresentationStore.js";
import { WRITE_DEADLINE, WRITE_DELAY } from "./constants.js";
import createPreferenceLayer from "./createPreferenceLayer.js";
import createPreferenceWriter from "./createPreferenceWriter.js";
import type { PreferenceResult, PresentationStore } from "./types.js";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
});

afterEach(() => {
  vi.useRealTimers();
});

/** A writer over a stand-in store, with its write and the two callbacks spied. */
const createWriterOver = (store: PresentationStore) => {
  const writes = vi.spyOn(store, "patchPresentation");
  const publish = vi.fn();
  const forget = vi.fn();
  const writer = createPreferenceWriter({ store, publish, forget });
  return { writer, writes, publish, forget };
};

describe("createPreferenceWriter", () => {
  it("applies a change at once and writes a burst merged by target after the delay", async () => {
    const { writer, writes, publish } = createWriterOver(
      createStandInPresentationStore(),
    );
    const kept = { layer: createPreferenceLayer(), target: "default" as const };
    const view = { layer: createPreferenceLayer(), target: { view: "v1" } };
    writer.persist(kept, { a: 1 });
    expect(kept.layer.values).toEqual({ a: 1 });
    await vi.advanceTimersByTimeAsync(WRITE_DELAY - 1);
    writer.persist(kept, { b: 2 });
    writer.persist(view, { c: 3 });
    await vi.advanceTimersByTimeAsync(WRITE_DELAY - 1);
    expect(writes).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(writes.mock.calls).toEqual([
      ["default", { a: 1, b: 2 }],
      [{ view: "v1" }, { c: 3 }],
    ]);
    expect(publish).toHaveBeenCalledTimes(2);
    expect(writer.flushed).toBe(3);
    expect(writer.failure).toBe("");
  });

  it("writes a burst that keeps coming once its deadline passes", async () => {
    const { writer, writes } = createWriterOver(
      createStandInPresentationStore(),
    );
    const kept = { layer: createPreferenceLayer(), target: "default" as const };
    for (let step = 0; step < WRITE_DEADLINE / 100; step += 1) {
      writer.persist(kept, { width: step });
      await vi.advanceTimersByTimeAsync(100);
    }
    expect(writes).toHaveBeenCalledTimes(1);
  });

  it("writes on the next turn a burst held past its deadline", async () => {
    const { writer, writes } = createWriterOver(
      createStandInPresentationStore(),
    );
    const kept = { layer: createPreferenceLayer(), target: "default" as const };
    writer.persist(kept, { a: 1 });
    vi.setSystemTime(Date.now() + WRITE_DEADLINE * 2);
    writer.persist(kept, { a: 2 });
    await vi.advanceTimersByTimeAsync(0);
    expect(writes.mock.calls).toEqual([["default", { a: 2 }]]);
  });

  it("writes on demand, and forgets a target the store no longer has", async () => {
    const { writer, writes, forget } = createWriterOver(
      createStandInPresentationStore({
        patchPresentation: async () => ({ status: "missing" }),
      }),
    );
    const target = { view: "gone" };
    writer.persist({ layer: createPreferenceLayer(), target }, { a: 1 });
    writer.flush();
    writer.flush();
    expect(writes).toHaveBeenCalledTimes(1);
    await vi.runAllTimersAsync();
    expect(writes).toHaveBeenCalledTimes(1);
    expect(forget).toHaveBeenCalledWith(target);
  });

  it("marks a failed write's keys failed, and reports why", async () => {
    const { writer, publish } = createWriterOver(
      createStandInPresentationStore({
        patchPresentation: async () => {
          throw new Error("quota exceeded");
        },
      }),
    );
    const kept = { layer: createPreferenceLayer(), target: "default" as const };
    writer.persist(kept, { a: 1 });
    writer.flush();
    await vi.runAllTimersAsync();
    expect(kept.layer.listUnsaved()).toEqual({ a: 1 });
    expect(writer.failure).toBe("quota exceeded");
    expect(publish).toHaveBeenCalledTimes(1);
  });

  it("leaves a key changed since its write to the change that owns it", async () => {
    const answer = createDeferred<PreferenceResult>();
    const { writer } = createWriterOver(
      createStandInPresentationStore({
        patchPresentation: () => answer.promise,
      }),
    );
    const kept = { layer: createPreferenceLayer(), target: "default" as const };
    writer.persist(kept, { a: 1, b: 1 });
    writer.flush();
    writer.persist(kept, { a: 2 });
    answer.reject(new Error("offline"));
    await vi.advanceTimersByTimeAsync(0);
    expect(kept.layer.listUnsaved()).toEqual({ b: 1 });
  });

  it("rewrites a layer's failed keys, and nothing for a layer with none", async () => {
    const { writer, writes } = createWriterOver(
      createStandInPresentationStore(),
    );
    const failed = createPreferenceLayer();
    failed.change({ a: 1 }, 1);
    failed.markFailed(["a"]);
    writer.rewrite({ layer: createPreferenceLayer(), target: "default" });
    writer.rewrite({ layer: failed, target: { view: "v1" } });
    await vi.runAllTimersAsync();
    expect(writes.mock.calls).toEqual([[{ view: "v1" }, { a: 1 }]]);
    expect(failed.hasFailed()).toBe(false);
  });
});
