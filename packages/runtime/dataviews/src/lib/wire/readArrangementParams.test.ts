import { describe, expect, it } from "vitest";
import readArrangementParams from "./readArrangementParams.js";

const read = (query: string) =>
  readArrangementParams(new URLSearchParams(query));

describe("readArrangementParams", () => {
  it("reads nothing from parameters carrying no arrangement", () => {
    expect(
      read("status=failed&view=v1&table.order=a&table.t.sort=a").size,
    ).toBe(0);
  });

  it("reads an order whole, hiding none where no hidden column is carried", () => {
    expect(read("table.t.order=cores&table.t.order=name").get("t")).toEqual({
      order: ["cores", "name"],
      hidden: [],
    });
    expect(
      read("table.t.order=cores&table.t.hidden=name&table.t.hidden=status").get(
        "t",
      ),
    ).toEqual({ order: ["cores"], hidden: ["name", "status"] });
  });

  it("leaves the order alone where only hidden columns are carried, and names no column by a blank", () => {
    expect(read("table.t.hidden=&table.t.hidden=cores").get("t")).toEqual({
      order: null,
      hidden: ["cores"],
    });
    expect(read("table.t.order=").get("t")).toEqual({ order: [], hidden: [] });
  });

  it("reads an encoded id back, and skips one no table could spell", () => {
    expect([
      ...read(
        new URLSearchParams([
          ["table.a%2Eb.order", "x"],
          ["table.%E0.order", "y"],
        ]).toString(),
      ),
    ]).toEqual([["a.b", { order: ["x"], hidden: [] }]]);
  });

  it("reads an id however the link spelled it", () => {
    const spelled = new URLSearchParams([
      ["table.a%2eb.order", "x"],
      ["table.a%2eb.hidden", "y"],
    ]);
    expect(read(spelled.toString()).get("a.b")).toEqual({
      order: ["x"],
      hidden: ["y"],
    });
  });

  it("reads each table's arrangement apart, by its id", () => {
    expect([...read("table.a.hidden=x&table.b.order=y")]).toEqual([
      ["a", { order: null, hidden: ["x"] }],
      ["b", { order: ["y"], hidden: [] }],
    ]);
  });
});
