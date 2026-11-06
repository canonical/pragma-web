import { describe, expect, it } from "vitest";
import declareMachineOrdering from "./declareMachineOrdering.js";

describe("declareMachineOrdering", () => {
  it("orders by all three fields, to the term limit and default given", () => {
    const declared = declareMachineOrdering(2, [
      { field: "cores", direction: "desc" },
    ]);
    expect(declared.sort.fields).toEqual(["name", "status", "cores"]);
    expect(declared.sort.terms).toBe(2);
    expect(declared.sort.default).toEqual([
      { field: "cores", direction: "desc" },
    ]);
    expect(declareMachineOrdering(null).sort.default).toEqual([]);
  });
});
