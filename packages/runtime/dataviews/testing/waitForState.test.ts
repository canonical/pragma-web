import { describe, expect, it, onTestFinished, TestRunner, vi } from "vitest";
import { createChannel } from "../src/lib/observable/index.js";
import runFailureHandlers from "./runFailureHandlers.js";
import waitForState from "./waitForState.js";

describe("waitForState", () => {
  it("resolves at once when the state already holds", async () => {
    const channel = createChannel(1);
    await waitForState(channel.subscribe, () => channel.get() === 1, "one");
    expect(channel.get()).toBe(1);
  });

  it("resolves on the first notification that brings the state", async () => {
    const channel = createChannel(0);
    const reached = waitForState(
      channel.subscribe,
      () => channel.get() === 2,
      "two",
    );
    channel.set(1);
    channel.set(2);
    channel.set(3);
    await reached;
    expect(channel.get()).toBe(3);
  });

  it("resolves and unsubscribes when the store notifies as it subscribes", async () => {
    const unsubscribe = vi.fn();
    let ready = false;
    await waitForState(
      (listener) => {
        ready = true;
        listener();
        return unsubscribe;
      },
      () => ready,
      "ready",
    );
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("names what it awaited when the test fails", async (context) => {
    const channel = createChannel(0);
    void waitForState(channel.subscribe, () => false, "the answer");
    await expect(runFailureHandlers(context)).resolves.toEqual([
      "Still waiting on the answer.",
    ]);
  });

  it("adds nothing when the test fails after the state", async (context) => {
    const channel = createChannel(0);
    const reached = waitForState(
      channel.subscribe,
      () => channel.get() === 1,
      "one",
    );
    channel.set(1);
    await reached;
    await expect(runFailureHandlers(context)).resolves.toEqual([]);
  });

  it("ignores notifications once the test is aborted", async (context) => {
    const aborted = new AbortController();
    const spy = vi.spyOn(TestRunner, "getCurrentTest").mockReturnValue({
      ...context.task,
      context: { ...context, signal: aborted.signal },
    });
    onTestFinished(() => {
      spy.mockRestore();
    });
    const channel = createChannel(0);
    void waitForState(channel.subscribe, () => channel.get() === 1, "one");
    aborted.abort();
    channel.set(1);
    await expect(runFailureHandlers(context)).resolves.toEqual([
      "Still waiting on one.",
    ]);
  });
});
