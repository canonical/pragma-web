import { describe, expect, it } from "vitest";
import pageOf from "./pageOf.js";

describe("pageOf", () => {
  it("is a complete page of the rows, counted exactly", () => {
    const page = pageOf([{ id: "a" }, { id: "b" }]);
    expect(page.rows).toHaveLength(2);
    expect(page.counts.matched).toEqual({ kind: "exact", value: 2 });
    expect(page.counts.pageable).toEqual({ kind: "exact", value: 2 });
    expect(page.cursors).toBeNull();
  });
});
