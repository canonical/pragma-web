import { describe, expect, it } from "vitest";
import deliverRows from "./deliverRows.js";
import pageOf from "./pageOf.js";

describe("deliverRows", () => {
  it("is the delivery of a page of the rows", () => {
    const rows = [{ id: "a" }];
    expect(deliverRows(rows)).toEqual({
      status: "succeeded",
      page: pageOf(rows),
    });
  });
});
