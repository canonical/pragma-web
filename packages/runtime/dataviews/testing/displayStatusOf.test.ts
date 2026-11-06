import { describe, expect, it } from "vitest";
import displayStatusOf from "./displayStatusOf.js";

describe("displayStatusOf", () => {
  it("gives a reason to the statuses that carry one", () => {
    expect(displayStatusOf("stale")).toEqual({
      status: "stale",
      reason: "offline",
    });
    expect(displayStatusOf("no-data")).toEqual({ status: "no-data" });
  });
});
