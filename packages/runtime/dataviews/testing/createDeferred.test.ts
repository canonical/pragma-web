import { describe, expect, it } from "vitest";
import createDeferred from "./createDeferred.js";

describe("createDeferred", () => {
  it("resolves its promise on cue", async () => {
    const deferred = createDeferred<number>();
    deferred.resolve(1);
    await expect(deferred.promise).resolves.toBe(1);
  });

  it("rejects its promise on cue", async () => {
    const deferred = createDeferred<number>();
    deferred.reject(new Error("refused"));
    await expect(deferred.promise).rejects.toThrow("refused");
  });
});
