import { describe, expect, it } from "vitest";
import countExactly from "./countExactly.js";
import pageOf from "./pageOf.js";

describe("pageOf", () => {
  it("is a complete page of the rows, counted exactly", () => {
    expect(pageOf([{ id: "a" }, { id: "b" }]).counts.matched).toEqual(
      countExactly(2),
    );
  });
});
