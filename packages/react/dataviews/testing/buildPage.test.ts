import { describe, expect, it } from "vitest";
import buildPage from "./buildPage.js";
import countExactly from "./countExactly.js";

describe("buildPage", () => {
  it("is a complete page of the rows, counted exactly", () => {
    expect(buildPage([{ id: "a" }, { id: "b" }]).counts.matched).toEqual(
      countExactly(2),
    );
  });
});
