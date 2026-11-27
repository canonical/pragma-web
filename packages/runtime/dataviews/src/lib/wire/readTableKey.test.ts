import { describe, expect, it } from "vitest";
import readTableKey from "./readTableKey.js";

describe("readTableKey", () => {
  it("reads a table's id however it was spelled, and its part", () => {
    expect(readTableKey("table.a%2Eb.order")).toEqual({
      table: "a.b",
      part: "order",
    });
    expect(readTableKey("table.a%2eb.hidden")).toEqual({
      table: "a.b",
      part: "hidden",
    });
  });

  it("reads nothing from a key that names no table's order or hidden columns", () => {
    expect(readTableKey("q")).toBeNull();
    expect(readTableKey("table.t.width.name")).toBeNull();
    expect(readTableKey("table.%E0%A4%A.order")).toBeNull();
  });
});
