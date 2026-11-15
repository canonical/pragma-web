import { describe, expect, it } from "vitest";
import { createSchema } from "../schema/index.js";
import readKeyPredicate from "./readKeyPredicate.js";

const schema = createSchema([
  { field: "status", kind: "choices", options: ["failed", "ready"] },
  { field: "cpu", kind: "number" },
  { field: "gpu", kind: "presence" },
]);

/** One key read against its field. */
const read = (key: string, field: string, values: readonly string[]) => {
  const definition = schema.findField(field);
  if (definition === undefined) {
    throw new Error(`no field ${field}`);
  }
  return readKeyPredicate(key, values, schema, definition);
};

describe("readKeyPredicate", () => {
  it("takes every valid option of a set, and reports the others", () => {
    const { conjunct, issues } = read("status__isAny__1", "status", [
      "failed",
      "melted",
      "ready",
    ]);
    expect(conjunct).toEqual({
      predicate: {
        field: "status",
        operator: "isAny",
        operands: ["failed", "ready"],
      },
      ordinal: 1,
      taken: [0, 2],
    });
    expect(issues.map((issue) => issue.code)).toEqual(["invalid"]);
  });

  it("takes the first valid value of a bound, and reports the extras", () => {
    const { conjunct, issues } = read("cpu__lte__1", "cpu", ["x", "8", "4"]);
    expect(conjunct?.predicate.operands).toEqual([8]);
    expect(conjunct?.taken).toEqual([1]);
    expect(issues.map((issue) => issue.code)).toEqual(["invalid", "malformed"]);
  });

  it("reads a presence key as a boolean, and reports any other value", () => {
    const { conjunct, issues } = read("gpu__isSet", "gpu", ["yes", "", "1"]);
    expect(conjunct?.predicate).toEqual({
      field: "gpu",
      operator: "isSet",
      operands: [true],
    });
    expect(conjunct?.taken).toEqual([2]);
    expect(issues.map((issue) => issue.code)).toEqual(["malformed"]);
  });

  it("reads a blank as no value, and nothing from blanks alone", () => {
    const { conjunct, issues } = read("cpu__gte", "cpu", ["", "4"]);
    expect(conjunct?.taken).toEqual([1]);
    expect(issues).toEqual([]);
    expect(read("gpu__isSet", "gpu", [""])).toEqual({
      issues: [],
      conjunct: null,
    });
  });

  it("reads nothing from a key the grammar cannot place", () => {
    expect(read("cpu__between", "cpu", ["4"]).conjunct).toBeNull();
    expect(read("cpu__gte__x", "cpu", ["4"]).conjunct).toBeNull();
    expect(read("cpu__gte", "cpu", ["x"]).conjunct).toBeNull();
    expect(read("status__gte", "status", ["4"]).issues).toHaveLength(1);
  });
});
