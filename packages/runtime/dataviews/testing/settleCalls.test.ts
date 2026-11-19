import { describe, expect, it, vi } from "vitest";
import createDeferred from "./createDeferred.js";
import settleCalls from "./settleCalls.js";

describe("settleCalls", () => {
  it("waits for every answer, kept or broken", async () => {
    const kept = createDeferred<number>();
    const broken = createDeferred<number>();
    const call = vi
      .fn<() => Promise<number>>()
      .mockReturnValueOnce(kept.promise)
      .mockReturnValueOnce(broken.promise);
    const heard: string[] = [];
    void call().then(() => heard.push("kept"));
    void call().catch(() => heard.push("broken"));
    const settled = settleCalls(call);
    kept.resolve(1);
    broken.reject(new Error("refused"));
    await settled;
    expect(heard).toEqual(["kept", "broken"]);
  });
});
