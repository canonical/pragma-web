import { describe, expect, it } from "vitest";
import buildRefusedResult from "./buildRefusedResult.js";

describe("buildRefusedResult", () => {
  it("refuses the sort once for each reason", () => {
    expect(
      buildRefusedResult("a", "b").refusals.map(({ reason }) => reason),
    ).toEqual(["a", "b"]);
  });
});
