import { describe, expect, it } from "vitest";
import buildPage from "./buildPage.js";
import deliverRows from "./deliverRows.js";

describe("deliverRows", () => {
  it("is the delivery of a page of the rows", () => {
    const rows = [{ id: "a" }];
    expect(deliverRows(rows)).toEqual({
      status: "succeeded",
      page: buildPage(rows),
    });
  });
});
