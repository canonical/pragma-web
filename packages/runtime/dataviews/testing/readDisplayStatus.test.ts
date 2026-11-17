import { describe, expect, it } from "vitest";
import readDisplayStatus from "./readDisplayStatus.js";

describe("readDisplayStatus", () => {
  it("gives a reason to the statuses that carry one", () => {
    expect(readDisplayStatus("stale")).toEqual({
      status: "stale",
      reason: "offline",
    });
    expect(readDisplayStatus("no-data")).toEqual({ status: "no-data" });
  });
});
