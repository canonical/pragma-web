import { describe, expect, it } from "vitest";
import {
  NO_PRESENTATION,
  TABLE_KEY_PATTERN,
  WRITE_DEADLINE,
  WRITE_DELAY,
} from "./constants.js";

describe("constants", () => {
  it("holds nothing in the empty arrangement, frozen", () => {
    expect(NO_PRESENTATION).toEqual({});
    expect(Object.isFrozen(NO_PRESENTATION)).toBe(true);
  });

  it("gathers changes for 200ms, and at most a second", () => {
    expect(WRITE_DELAY).toBe(200);
    expect(WRITE_DEADLINE).toBe(1000);
  });

  it("keeps each table's arrangement under the renderer's prefix and its id", () => {
    expect(TABLE_KEY_PATTERN.test("table.t.order")).toBe(true);
    expect(TABLE_KEY_PATTERN.test("table.t.hidden")).toBe(true);
    expect(TABLE_KEY_PATTERN.test("table.t.width.a.b")).toBe(true);
    expect(TABLE_KEY_PATTERN.test("table.order")).toBe(false);
    expect(TABLE_KEY_PATTERN.test("table.t.width.")).toBe(false);
    expect(TABLE_KEY_PATTERN.test("table.t.sort")).toBe(false);
  });
});
