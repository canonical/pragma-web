import { describe, expect, it } from "vitest";
import readLocatedArrangement from "./readLocatedArrangement.js";

describe("readLocatedArrangement", () => {
  it("reads a carried order and hidden columns as the keys they stand for", () => {
    expect(
      readLocatedArrangement(
        new URLSearchParams(
          "status=running&table.t.order=cores&table.t.order=name&table.t.hidden=status",
        ),
      ),
    ).toEqual({
      "table.t.order": ["cores", "name"],
      "table.t.hidden": ["status"],
    });
  });

  it("keeps no order when only hidden columns are carried, and shows every column when only an order is", () => {
    expect(
      readLocatedArrangement(new URLSearchParams("table.t.hidden=status")),
    ).toEqual({ "table.t.hidden": ["status"] });
    expect(
      readLocatedArrangement(new URLSearchParams("table.t.order=cores")),
    ).toEqual({ "table.t.order": ["cores"], "table.t.hidden": [] });
  });

  it("reads no arrangement from a location carrying none, or from no location", () => {
    expect(
      readLocatedArrangement(new URLSearchParams("status=running")),
    ).toBeNull();
    expect(readLocatedArrangement(undefined)).toBeNull();
  });
});
