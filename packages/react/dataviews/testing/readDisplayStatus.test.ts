import { describe, expect, it } from "vitest";
import readDisplayStatus from "./readDisplayStatus.js";

describe("readDisplayStatus", () => {
  it("gives a reason to the statuses that carry one", () => {
    expect(readDisplayStatus("failed")).toEqual({
      status: "failed",
      reason: "offline",
    });
    expect(readDisplayStatus("pending")).toEqual({ status: "pending" });
  });
});
