import { describe, expect, it } from "vitest";
import isReservedKey from "./isReservedKey.js";

describe("isReservedKey", () => {
  it("reserves the grammar's names and a table's order and hidden parameters", () => {
    expect(isReservedKey("view")).toBe(true);
    expect(isReservedKey("table.machines.order")).toBe(true);
    expect(isReservedKey("status")).toBe(false);
  });

  it("leaves a name under table that no arrangement parameter spells", () => {
    expect(isReservedKey("table.name")).toBe(false);
    expect(isReservedKey("table.t.width.name")).toBe(false);
  });
});
