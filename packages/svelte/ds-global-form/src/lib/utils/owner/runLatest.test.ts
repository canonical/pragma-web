import { describe, expect, it } from "vitest";
import runLatest from "./runLatest.js";

/** Returns a promise with its resolve and reject functions. */
function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

describe("runLatest", () => {
  it("resolves the latest run with its value", async () => {
    const runner = runLatest(async (input: number) => input * 2);
    expect(await runner.run(2)).toEqual({ status: "done", value: 4 });
  });

  it("supersedes and aborts the previous run, whatever it returns", async () => {
    const first = createDeferred<string>();
    const second = createDeferred<string>();
    const signals: AbortSignal[] = [];
    const runner = runLatest((input: number, signal) => {
      signals.push(signal);
      return input === 1 ? first.promise : second.promise;
    });
    const earlier = runner.run(1);
    const later = runner.run(2);
    expect(signals.at(0)?.aborted).toBe(true);
    first.resolve("stale");
    second.resolve("fresh");
    expect(await earlier).toEqual({ status: "superseded" });
    expect(await later).toEqual({ status: "done", value: "fresh" });
  });

  it("reports a failure of the latest run, and hides one of a superseded run", async () => {
    const failing = runLatest(async () => {
      throw new Error("offline");
    });
    expect(await failing.run(undefined)).toEqual({
      status: "failed",
      error: new Error("offline"),
    });
    const pending = createDeferred<string>();
    const cancelled = runLatest(() => pending.promise);
    const run = cancelled.run(undefined);
    cancelled.cancel();
    pending.reject(new Error("aborted"));
    expect(await run).toEqual({ status: "superseded" });
  });
});
