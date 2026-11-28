import { describe, expect, it } from "vitest";
import pickTableKeys from "./pickTableKeys.js";

describe("pickTableKeys", () => {
  it("keeps a table's keys and drops every other", () => {
    expect(
      pickTableKeys({
        "table.t.order": ["a"],
        "table.order": ["b"],
        "table.width.order": 120,
        "table.width.hidden": 80,
        "cards.size": 2,
      }),
    ).toEqual({ "table.t.order": ["a"] });
  });
});
