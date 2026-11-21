import { describe, expect, it } from "vitest";
import readEntitySummary from "./readEntitySummary.js";

describe("readEntitySummary", () => {
  it("reads the definition first", () => {
    expect(readEntitySummary({ definition: "D", comment: "C" })).toBe("D");
  });

  it("reads the comment when the entity has no definition", () => {
    expect(readEntitySummary({ definition: null, comment: "C" })).toBe("C");
  });

  it("reads nothing when the entity states neither", () => {
    expect(
      readEntitySummary({ definition: undefined, comment: null }),
    ).toBeUndefined();
  });
});
