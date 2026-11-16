import { describe, expect, it } from "vitest";
import buildFailedResult from "./buildFailedResult.js";

describe("buildFailedResult", () => {
  it("fails with the reason, raised as an error", () => {
    const failed = buildFailedResult("offline");
    expect(failed.failure.reason).toBe("offline");
    expect(failed.failure.cause).toEqual(new Error("offline"));
  });
});
