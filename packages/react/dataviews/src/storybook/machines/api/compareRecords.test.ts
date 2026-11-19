import { describe, expect, it } from "vitest";
import compareRecords from "./compareRecords.js";
import type { ApiRecord } from "./types.js";

/** The ids of these records, sorted by one term. */
const sortIds = (
  records: readonly ApiRecord[],
  field: string,
  direction: "asc" | "desc",
): readonly string[] =>
  [...records].sort(compareRecords({ field, direction })).map(({ id }) => id);

describe("compareRecords", () => {
  it("orders text by its collation, digits by their number", () => {
    const records = [
      { id: "a", name: "node-10" },
      { id: "b", name: "Node-2" },
      { id: "c", name: "node-1" },
    ];
    expect(sortIds(records, "name", "asc")).toEqual(["c", "b", "a"]);
    expect(sortIds(records, "name", "desc")).toEqual(["a", "b", "c"]);
  });

  it("orders numbers by value", () => {
    const records = [
      { id: "a", cores: 16 },
      { id: "b", cores: 2 },
      { id: "c", cores: 8 },
    ];
    expect(sortIds(records, "cores", "asc")).toEqual(["b", "c", "a"]);
    expect(sortIds(records, "cores", "desc")).toEqual(["a", "c", "b"]);
  });

  it("orders a status by the lifecycle, not by its text", () => {
    const records = [
      { id: "a", status: "pending" },
      { id: "b", status: "running" },
      { id: "c", status: "failed" },
    ];
    expect(sortIds(records, "status", "asc")).toEqual(["b", "c", "a"]);
    expect(sortIds(records, "status", "desc")).toEqual(["a", "c", "b"]);
  });

  it("compares an empty value with a value, and two empty values", () => {
    const compare = compareRecords({ field: "name", direction: "asc" });
    expect(compare({ id: "a" }, { id: "b" })).toBe(0);
    expect(compare({ id: "a" }, { id: "b", name: "beta" })).toBe(1);
    expect(compare({ id: "a", name: "alpha" }, { id: "b" })).toBe(-1);
  });

  it("orders empty values last in both directions, keeping their order", () => {
    const records = [
      { id: "blank", name: "" },
      { id: "a", name: "alpha" },
      { id: "absent" },
      { id: "b", name: "beta" },
    ];
    expect(sortIds(records, "name", "asc")).toEqual([
      "a",
      "b",
      "blank",
      "absent",
    ]);
    const numbers = [
      { id: "nan", cores: Number.NaN },
      { id: "four", cores: 4 },
      { id: "infinite", cores: Number.POSITIVE_INFINITY },
    ];
    expect(sortIds(numbers, "cores", "desc")).toEqual([
      "four",
      "nan",
      "infinite",
    ]);
    const statuses = [
      { id: "unknown", status: "retired" },
      { id: "number", status: 3 },
      { id: "running", status: "running" },
    ];
    expect(sortIds(statuses, "status", "asc")).toEqual([
      "running",
      "unknown",
      "number",
    ]);
  });
});
