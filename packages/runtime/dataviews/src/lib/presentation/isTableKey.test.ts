import { describe, expect, it } from "vitest";
import isTableKey from "./isTableKey.js";

describe("isTableKey", () => {
  it("tells a table's own keys from any other", () => {
    expect(isTableKey("table.machines.order")).toBe(true);
    expect(isTableKey("table.machines.width.name")).toBe(true);
    expect(isTableKey("table.order")).toBe(false);
    expect(isTableKey("width")).toBe(false);
    expect(isTableKey("table.width.order")).toBe(false);
    expect(isTableKey("table.width.hidden")).toBe(false);
  });
});
