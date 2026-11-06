import { describe, expect, it } from "vitest";
import displayStatusOf from "./displayStatusOf.js";

describe("displayStatusOf", () => {
  it("gives a reason to the statuses that carry one", () => {
    expect(displayStatusOf("failed")).toEqual({
      status: "failed",
      reason: "offline",
    });
    expect(displayStatusOf("pending")).toEqual({ status: "pending" });
  });
});
