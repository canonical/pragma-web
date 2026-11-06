import { describe, expect, it } from "vitest";
import failedWith from "./failedWith.js";

describe("failedWith", () => {
  it("fails with the reason, raised as an error", () => {
    const failed = failedWith("offline");
    expect(failed.failure.reason).toBe("offline");
    expect(failed.failure.cause).toEqual(new Error("offline"));
  });
});
