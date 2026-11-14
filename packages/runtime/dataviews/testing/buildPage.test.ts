import { describe, expect, it } from "vitest";
import buildPage from "./buildPage.js";

describe("buildPage", () => {
  it("is a complete page of the rows, counted exactly", () => {
    const page = buildPage([{ id: "a" }, { id: "b" }]);
    expect(page.rows).toHaveLength(2);
    expect(page.counts.matched).toEqual({ kind: "exact", value: 2 });
    expect(page.counts.pageable).toEqual({ kind: "exact", value: 2 });
    expect(page.cursors).toBeNull();
  });
});
