import { describe, expect, it } from "vitest";
import areRecordsEqual from "./areRecordsEqual.js";

describe("areRecordsEqual", () => {
  it("holds one record equal to itself", () => {
    const record = { id: "a", nested: {} };
    expect(areRecordsEqual(record, record)).toBe(true);
  });

  it("holds a fresh object with the same fields equal", () => {
    expect(areRecordsEqual({ id: "a", cores: 2 }, { cores: 2, id: "a" })).toBe(
      true,
    );
  });

  it("tells records apart by a moved value, a missing field or an extra one", () => {
    expect(areRecordsEqual({ id: "a" }, { id: "b" })).toBe(false);
    expect(areRecordsEqual({ id: "a", x: undefined }, { id: "a", y: 1 })).toBe(
      false,
    );
    expect(areRecordsEqual({ id: "a" }, { id: "a", y: 1 })).toBe(false);
  });

  it("compares a nested value by identity", () => {
    expect(areRecordsEqual({ nested: {} }, { nested: {} })).toBe(false);
  });
});
