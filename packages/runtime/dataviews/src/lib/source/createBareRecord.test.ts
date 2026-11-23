import { describe, expect, it } from "vitest";
import createBareRecord from "./createBareRecord.js";

describe("createBareRecord", () => {
  it("creates an empty record with no prototype", () => {
    const record = createBareRecord<number>();
    expect(Object.getPrototypeOf(record)).toBeNull();
    expect(Object.keys(record)).toEqual([]);
  });

  it("reads a key named for a prototype member as absent", () => {
    expect("toString" in createBareRecord<number>()).toBe(false);
  });
});
