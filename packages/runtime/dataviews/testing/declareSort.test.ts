import { describe, expect, it } from "vitest";
import declareSort from "./declareSort.js";

describe("declareSort", () => {
  it("orders by the given fields, unlimited unless a term limit is given", () => {
    expect(declareSort(["cpu"])).toMatchObject({
      fields: ["cpu"],
      terms: null,
    });
    expect(declareSort(["cpu"], 2).terms).toBe(2);
  });
});
